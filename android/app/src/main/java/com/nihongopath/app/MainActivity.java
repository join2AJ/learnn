package com.nihongopath.app;

import android.Manifest;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Locale;

/**
 * Thin native shell around the web app in assets/www.
 * Assets are served from https://appassets.androidplatform.net so the page is a secure
 * origin (needed for microphone access in the Sound Lab) and localStorage persists.
 * The JS bridge "Native" provides text-to-speech, speech recognition, haptics and links.
 */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START = "https://" + HOST + "/assets/www/index.html";
    private static final int REQ_MIC_WEB = 1, REQ_MIC_SPEECH = 2, REQ_MIC_JS = 3;

    private WebView web;
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private SpeechRecognizer recognizer;
    private String pendingSpeechLang = null;
    private PermissionRequest pendingWebPermission = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window w = getWindow();
        w.setStatusBarColor(Color.parseColor("#F7F3EC"));
        w.setNavigationBarColor(Color.parseColor("#F7F3EC"));
        if (Build.VERSION.SDK_INT >= 23) w.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);

        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                ttsReady = true;
                tts.setLanguage(Locale.JAPAN);
                tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override public void onStart(String id) { js("window.__nativeTts&&window.__nativeTts({type:'start',id:" + JSONObject.quote(id) + "})"); }
                    @Override public void onDone(String id) { js("window.__nativeTts&&window.__nativeTts({type:'done',id:" + JSONObject.quote(id) + "})"); }
                    @Override public void onError(String id) { onDone(id); }
                    @Override public void onStop(String id, boolean interrupted) { onDone(id); }
                });
            }
        });

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#F7F3EC"));
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setTextZoom(100);

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .setDomain(HOST)
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
                return loader.shouldInterceptRequest(r.getUrl());
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if (HOST.equals(u.getHost())) return false;
                openExternalUri(u);
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    boolean wantsAudio = false;
                    for (String res : request.getResources()) if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(res)) wantsAudio = true;
                    if (!wantsAudio) { request.deny(); return; }
                    if (hasMicPermission()) request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
                    else { pendingWebPermission = request; askMic(REQ_MIC_WEB); }
                });
            }
        });
        web.addJavascriptInterface(new Bridge(), "Native");
        setContentView(web);
        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl(START);
    }

    /* ---------------- JavaScript bridge ---------------- */
    public class Bridge {
        @JavascriptInterface
        public void speak(String text, String lang, float rate, String id) {
            if (!ttsReady) return;
            tts.setLanguage(Locale.forLanguageTag(lang));
            tts.setSpeechRate(rate);
            Bundle params = new Bundle();
            params.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, id);
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, params, id);
        }
        @JavascriptInterface public void stopSpeaking() { if (ttsReady) tts.stop(); }
        @JavascriptInterface
        public String ttsStatus() {
            boolean voice = false;
            if (ttsReady) {
                int r = tts.isLanguageAvailable(Locale.JAPAN);
                voice = r >= TextToSpeech.LANG_AVAILABLE;
            }
            return "{\"ready\":" + ttsReady + ",\"voice\":" + voice + "}";
        }
        @JavascriptInterface
        public void openTtsSettings() {
            runOnUiThread(() -> {
                try { startActivity(new Intent("com.android.settings.TTS_SETTINGS")); }
                catch (Exception e) {
                    try { startActivity(new Intent(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA)); } catch (Exception ignored) { }
                }
            });
        }
        @JavascriptInterface public void startListening(String lang) { runOnUiThread(() -> beginSpeech(lang)); }
        @JavascriptInterface public void stopListening() { runOnUiThread(() -> { if (recognizer != null) recognizer.stopListening(); }); }
        @JavascriptInterface public boolean hasMic() { return hasMicPermission(); }
        @JavascriptInterface public void requestMic() { runOnUiThread(() -> askMic(REQ_MIC_JS)); }
        @JavascriptInterface
        public void vibrate(int ms) {
            Vibrator v = (Vibrator) getSystemService(VIBRATOR_SERVICE);
            if (v == null || !v.hasVibrator()) return;
            if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createOneShot(Math.max(1, ms), VibrationEffect.DEFAULT_AMPLITUDE));
            else v.vibrate(ms);
        }
        @JavascriptInterface
        public void setTheme(boolean dark) {
            runOnUiThread(() -> {
                int c = Color.parseColor(dark ? "#0E1016" : "#F7F3EC");
                Window w = getWindow();
                w.setStatusBarColor(c);
                w.setNavigationBarColor(c);
                web.setBackgroundColor(c);
                int flags = 0;
                if (!dark && Build.VERSION.SDK_INT >= 23) flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                if (!dark && Build.VERSION.SDK_INT >= 26) flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                w.getDecorView().setSystemUiVisibility(flags);
            });
        }
        @JavascriptInterface public void openExternal(String url) { runOnUiThread(() -> openExternalUri(Uri.parse(url))); }
        @JavascriptInterface
        public String appVersion() {
            try { return getPackageManager().getPackageInfo(getPackageName(), 0).versionName; } catch (Exception e) { return "android"; }
        }
    }

    /* ---------------- speech recognition ---------------- */
    private void beginSpeech(String lang) {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            speechEvent("error", null, "Speech recognition is not available on this phone. Install/enable the Google app.");
            return;
        }
        if (!hasMicPermission()) { pendingSpeechLang = lang; askMic(REQ_MIC_SPEECH); return; }
        if (recognizer != null) recognizer.destroy();
        recognizer = SpeechRecognizer.createSpeechRecognizer(this);
        recognizer.setRecognitionListener(new RecognitionListener() {
            @Override public void onReadyForSpeech(Bundle b) { speechEvent("ready", null, null); }
            @Override public void onBeginningOfSpeech() { }
            @Override public void onRmsChanged(float v) { }
            @Override public void onBufferReceived(byte[] b) { }
            @Override public void onEndOfSpeech() { }
            @Override public void onError(int code) { speechEvent("error", null, errorText(code)); speechEvent("end", null, null); }
            @Override public void onResults(Bundle b) { speechEvent("result", b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION), null); speechEvent("end", null, null); }
            @Override public void onPartialResults(Bundle b) { speechEvent("partial", b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION), null); }
            @Override public void onEvent(int t, Bundle b) { }
        });
        Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, lang);
        i.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
        i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5);
        recognizer.startListening(i);
    }

    private static String errorText(int code) {
        switch (code) {
            case SpeechRecognizer.ERROR_NO_MATCH: return "no-speech";
            case SpeechRecognizer.ERROR_SPEECH_TIMEOUT: return "no-speech";
            case SpeechRecognizer.ERROR_NETWORK: case SpeechRecognizer.ERROR_NETWORK_TIMEOUT: return "Network problem — speech recognition needs internet or the offline Japanese pack.";
            case SpeechRecognizer.ERROR_AUDIO: return "Microphone error.";
            case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS: return "Microphone permission denied.";
            case SpeechRecognizer.ERROR_RECOGNIZER_BUSY: return "Recogniser busy — try again.";
            default: return "Recognition error " + code;
        }
    }

    private void speechEvent(String type, ArrayList<String> texts, String err) {
        try {
            JSONObject o = new JSONObject();
            o.put("type", type);
            if (texts != null) o.put("texts", new JSONArray(texts));
            if (err != null) o.put("error", err);
            js("window.__nativeSpeech&&window.__nativeSpeech(" + o + ")");
        } catch (Exception ignored) { }
    }

    /* ---------------- permissions ---------------- */
    private boolean hasMicPermission() {
        return Build.VERSION.SDK_INT < 23 || checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
    }
    private void askMic(int code) {
        if (Build.VERSION.SDK_INT >= 23) requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, code);
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] results) {
        super.onRequestPermissionsResult(code, perms, results);
        boolean ok = results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED;
        if (code == REQ_MIC_WEB && pendingWebPermission != null) {
            if (ok) pendingWebPermission.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
            else pendingWebPermission.deny();
            pendingWebPermission = null;
        } else if (code == REQ_MIC_SPEECH) {
            if (ok && pendingSpeechLang != null) beginSpeech(pendingSpeechLang);
            else speechEvent("error", null, "Microphone permission denied.");
            pendingSpeechLang = null;
        } else if (code == REQ_MIC_JS) {
            js("window.__nativePerm&&window.__nativePerm(" + ok + ")");
        }
    }

    /* ---------------- helpers ---------------- */
    private void openExternalUri(Uri u) {
        try { startActivity(new Intent(Intent.ACTION_VIEW, u).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)); }
        catch (ActivityNotFoundException ignored) { }
    }
    private void js(final String code) { runOnUiThread(() -> { if (web != null) web.evaluateJavascript(code, null); }); }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }
    @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); if (web != null) web.saveState(out); }
    @Override protected void onPause() {
        // let the web app save progress and study time before we may be killed
        js("window.dispatchEvent(new Event('pagehide'))");
        if (web != null) web.onPause();
        super.onPause();
    }
    @Override protected void onResume() { super.onResume(); if (web != null) web.onResume(); }
    @Override
    protected void onDestroy() {
        if (tts != null) { tts.stop(); tts.shutdown(); }
        if (recognizer != null) recognizer.destroy();
        if (web != null) web.destroy();
        super.onDestroy();
    }
}
