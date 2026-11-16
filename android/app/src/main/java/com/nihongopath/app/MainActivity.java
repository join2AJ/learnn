package com.nihongopath.app;

import android.Manifest;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.util.Base64;
import android.content.ContentValues;
import android.provider.MediaStore;
import android.os.Environment;
import android.webkit.ValueCallback;
import java.io.File;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
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

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
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
    private static final int REQ_MIC_WEB = 1, REQ_MIC_SPEECH = 2, REQ_MIC_JS = 3, REQ_MIC_CAPTURE = 4;

    private WebView web;
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private SpeechRecognizer recognizer;
    private String pendingSpeechLang = null;
    private PermissionRequest pendingWebPermission = null;
    private String[] pendingCapture = null; // lang, ms, id
    private SpeechRecognizer captureRecognizer;
    private String pendingAction = null;
    private ValueCallback<Uri[]> fileCallback = null;
    private static final int REQ_FILE = 20, REQ_NOTIF = 21, REQ_CLOUD_SAVE = 22, REQ_CLOUD_PICK = 23;
    private String pendingCloudContent = null;

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

        WebView.setWebContentsDebuggingEnabled(false); // no remote inspection of the app
        web = new WebView(this);
        // Android 13+ back gesture (required for target SDK 36 where onBackPressed is no longer called).
        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT, () -> {
                if (web != null && web.canGoBack()) web.goBack(); else finish();
            });
        }
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
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = cb;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*");
                try { startActivityForResult(i, REQ_FILE); } catch (Exception e) { fileCallback = null; return false; }
                return true;
            }
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
        pendingAction = getIntent() != null ? getIntent().getStringExtra("action") : null;
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
        public String ttsStatusFor(String lang) {
            boolean voice = false;
            if (ttsReady) voice = tts.isLanguageAvailable(Locale.forLanguageTag(lang)) >= TextToSpeech.LANG_AVAILABLE;
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
        /** Record ms of audio once; send the PCM to JS and (Android 13+) feed the same audio to speech recognition. */
        @JavascriptInterface public void recordAndRecognize(String lang, int ms, String id) { runOnUiThread(() -> startCapture(lang, ms, id)); }
        /** Save text to Downloads/NihongoPath (survives uninstall). Returns where it was saved or "error:…". */
        @JavascriptInterface
        public String saveBackup(String name, String content) {
            try {
                byte[] data = content.getBytes(StandardCharsets.UTF_8);
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues v = new ContentValues();
                    v.put(MediaStore.Downloads.DISPLAY_NAME, name);
                    v.put(MediaStore.Downloads.MIME_TYPE, "application/octet-stream");
                    v.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/NihongoPath");
                    Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                    if (uri == null) return "error:could not create file";
                    try (OutputStream o = getContentResolver().openOutputStream(uri)) { o.write(data); }
                    return "Downloads/NihongoPath/" + name;
                } else {
                    File dir = new File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "NihongoPath");
                    dir.mkdirs();
                    File f = new File(dir, name);
                    try (java.io.FileOutputStream o = new java.io.FileOutputStream(f)) { o.write(data); }
                    return f.getAbsolutePath();
                }
            } catch (Exception e) { return "error:" + e.getMessage(); }
        }
        /** Daily (weekday = -1) or weekly (1 = Sunday … 7 = Saturday) backup reminder at hour:minute. */
        @JavascriptInterface
        public void scheduleBackup(int hour, int minute, int weekday) {
            BackupReminder.schedule(MainActivity.this, hour, minute, weekday);
            if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED)
                runOnUiThread(() -> requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, REQ_NOTIF));
        }
        @JavascriptInterface public void cancelBackup() { BackupReminder.cancel(MainActivity.this); }
        /** One-shot action from a notification tap (e.g. "backup"). */
        @JavascriptInterface public String takeAction() { String a = pendingAction; pendingAction = null; return a == null ? "" : a; }
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
        /** Save a copy anywhere the user chooses - Google Drive, OneDrive, Dropbox… (system file picker). */
        @JavascriptInterface public void saveBackupAs(String name, String content) {
            pendingCloudContent = content;
            runOnUiThread(() -> {
                Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("application/octet-stream").putExtra(Intent.EXTRA_TITLE, name);
                try { startActivityForResult(i, REQ_CLOUD_SAVE); } catch (Exception e) { js("window.__npCloud&&window.__npCloud('error','No file picker available')"); }
            });
        }
        /** Choose one cloud file that automatic backups keep updating. */
        @JavascriptInterface public void pickCloudTarget(String name) {
            runOnUiThread(() -> {
                Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("application/octet-stream").putExtra(Intent.EXTRA_TITLE, name)
                    .addFlags(Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                try { startActivityForResult(i, REQ_CLOUD_PICK); } catch (Exception e) { js("window.__npCloud&&window.__npCloud('error','No file picker available')"); }
            });
        }
        /** Overwrite the chosen cloud file. Returns "ok", "none" or "error:…". */
        @JavascriptInterface public String writeCloudTarget(String content) {
            String u = getSharedPreferences("np", MODE_PRIVATE).getString("cloudUri", null);
            if (u == null) return "none";
            return writeUri(Uri.parse(u), content);
        }
        @JavascriptInterface public void clearCloudTarget() { getSharedPreferences("np", MODE_PRIVATE).edit().remove("cloudUri").apply(); }
        /** Device details for feedback/bug reports (only sent if the user chooses to send a report). */
        @JavascriptInterface public String deviceInfo() {
            try {
                org.json.JSONObject o = new org.json.JSONObject();
                o.put("manufacturer", android.os.Build.MANUFACTURER); o.put("model", android.os.Build.MODEL);
                o.put("android", android.os.Build.VERSION.RELEASE); o.put("sdk", android.os.Build.VERSION.SDK_INT);
                android.content.pm.PackageInfo wv = android.os.Build.VERSION.SDK_INT >= 26 ? WebView.getCurrentWebViewPackage() : null;
                o.put("webview", wv == null ? "" : wv.versionName);
                o.put("locale", java.util.Locale.getDefault().toString());
                android.util.DisplayMetrics dm = getResources().getDisplayMetrics();
                o.put("screen", dm.widthPixels + "x" + dm.heightPixels + " @" + dm.densityDpi + "dpi");
                android.content.pm.PackageInfo me = getPackageManager().getPackageInfo(getPackageName(), 0);
                o.put("installed", me.firstInstallTime); o.put("updated", me.lastUpdateTime);
                return o.toString();
            } catch (Exception e) { return "{}"; }
        }
        /** Share a JPEG (base64) with text via the Android share sheet. */
        @JavascriptInterface public void shareImage(String b64, String name, String text) {
            runOnUiThread(() -> {
                try {
                    java.io.File dir = new java.io.File(getCacheDir(), "share"); dir.mkdirs();
                    java.io.File f = new java.io.File(dir, name.replaceAll("[^A-Za-z0-9._-]", "_"));
                    try (java.io.FileOutputStream os = new java.io.FileOutputStream(f)) { os.write(android.util.Base64.decode(b64, android.util.Base64.DEFAULT)); }
                    Uri u = androidx.core.content.FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".files", f);
                    Intent i = new Intent(Intent.ACTION_SEND).setType("image/jpeg").putExtra(Intent.EXTRA_STREAM, u).putExtra(Intent.EXTRA_TEXT, text).addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    startActivity(Intent.createChooser(i, "Share"));
                } catch (Exception e) { js("window.__npToast&&window.__npToast('Could not share: '+" + org.json.JSONObject.quote(String.valueOf(e.getMessage())) + ")"); }
            });
        }
        /** Key that unlocks the app's encrypted content. Derived from this app's signing certificate,
         *  so a modified / re-signed copy of the app cannot read the content. */
        @JavascriptInterface public String contentKey() { return ContentKey.derive(MainActivity.this); }
        @JavascriptInterface public void openExternal(String url) { runOnUiThread(() -> openExternalUri(Uri.parse(url))); }
        @JavascriptInterface public void shareText(String subject, String text) {
            runOnUiThread(() -> {
                Intent i = new Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_SUBJECT, subject).putExtra(Intent.EXTRA_TEXT, text);
                try { startActivity(Intent.createChooser(i, subject)); } catch (Exception e) { /* no share target */ }
            });
        }
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

    /* ---------------- one-shot capture + recognition ---------------- */
    private void captureEvent(String id, String type, String pcm, ArrayList<String> texts, String err) {
        try {
            JSONObject o = new JSONObject();
            o.put("id", id); o.put("type", type);
            if (pcm != null) o.put("pcm", pcm);
            if (texts != null) o.put("texts", new JSONArray(texts));
            if (err != null) o.put("error", err);
            js("window.__nativeCapture&&window.__nativeCapture(" + o + ")");
        } catch (Exception ignored) { }
    }

    private void startCapture(final String lang, final int ms, final String id) {
        if (!hasMicPermission()) { pendingCapture = new String[]{lang, String.valueOf(ms), id}; askMic(REQ_MIC_CAPTURE); return; }
        final int sr = 16000;
        final int minBuf = Math.max(AudioRecord.getMinBufferSize(sr, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT), 4096);
        final AudioRecord ar;
        try { ar = new AudioRecord(MediaRecorder.AudioSource.VOICE_RECOGNITION, sr, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT, minBuf * 4); }
        catch (Exception e) { captureEvent(id, "audio", null, null, "mic"); return; }
        ParcelFileDescriptor[] pipe = null;
        if (Build.VERSION.SDK_INT >= 33 && SpeechRecognizer.isRecognitionAvailable(this)) {
            try {
                pipe = ParcelFileDescriptor.createPipe();
                if (captureRecognizer != null) captureRecognizer.destroy();
                captureRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
                captureRecognizer.setRecognitionListener(new RecognitionListener() {
                    boolean done = false;
                    @Override public void onReadyForSpeech(Bundle b) { }
                    @Override public void onBeginningOfSpeech() { }
                    @Override public void onRmsChanged(float v) { }
                    @Override public void onBufferReceived(byte[] b) { }
                    @Override public void onEndOfSpeech() { }
                    @Override public void onError(int code) { if (done) return; done = true; captureEvent(id, "asr", null, null, "code" + code); }
                    @Override public void onResults(Bundle b) { if (done) return; done = true; ArrayList<String> r = b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION); captureEvent(id, "asr", null, r == null ? new ArrayList<>() : r, null); }
                    @Override public void onPartialResults(Bundle b) { }
                    @Override public void onEvent(int t, Bundle b) { }
                });
                Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang);
                i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5);
                i.putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE, pipe[0]);
                i.putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE_CHANNEL_COUNT, 1);
                i.putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE_ENCODING, AudioFormat.ENCODING_PCM_16BIT);
                i.putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE_SAMPLING_RATE, sr);
                captureRecognizer.startListening(i);
            } catch (Exception e) { pipe = null; captureEvent(id, "asr", null, null, "unsupported"); }
        } else {
            captureEvent(id, "asr", null, null, "unsupported");
        }
        final ParcelFileDescriptor[] fp = pipe;
        new Thread(() -> {
            ByteArrayOutputStream all = new ByteArrayOutputStream();
            FileOutputStream out = null;
            try { if (fp != null) out = new FileOutputStream(fp[1].getFileDescriptor()); } catch (Exception ignored) { }
            byte[] buf = new byte[minBuf];
            long end = System.currentTimeMillis() + ms;
            try {
                ar.startRecording();
                while (System.currentTimeMillis() < end) {
                    int n = ar.read(buf, 0, buf.length);
                    if (n <= 0) continue;
                    all.write(buf, 0, n);
                    if (out != null) { try { out.write(buf, 0, n); } catch (Exception e) { out = null; } }
                }
            } catch (Exception ignored) { }
            try { ar.stop(); } catch (Exception ignored) { }
            ar.release();
            try { if (out != null) out.close(); if (fp != null) { fp[1].close(); } } catch (Exception ignored) { }
            captureEvent(id, "audio", Base64.encodeToString(all.toByteArray(), Base64.NO_WRAP), null, null);
        }).start();
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
        } else if (code == REQ_MIC_CAPTURE && pendingCapture != null) {
            String[] c = pendingCapture; pendingCapture = null;
            if (ok) startCapture(c[0], Integer.parseInt(c[1]), c[2]);
            else captureEvent(c[2], "audio", null, null, "denied");
        } else if (code == REQ_MIC_JS) {
            js("window.__nativePerm&&window.__nativePerm(" + ok + ")");
        }
    }

    /* ---------------- helpers ---------------- */
    private void openExternalUri(Uri u) {
        try { startActivity(new Intent(Intent.ACTION_VIEW, u).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)); }
        catch (ActivityNotFoundException ignored) { }
    }
    private String writeUri(Uri u, String content) {
        try (java.io.OutputStream os = getContentResolver().openOutputStream(u, "wt")) {
            if (os == null) return "error:cannot open";
            os.write(content.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return "ok";
        } catch (Exception e) { return "error:" + e.getMessage(); }
    }
    private String describe(Uri u) {
        String app = u.getAuthority() == null ? "" : u.getAuthority();
        String name = app.contains("google.android.apps.docs") ? "Google Drive" : app.contains("skydrive") || app.contains("onedrive") ? "OneDrive" : app.contains("dropbox") ? "Dropbox" : app.contains("externalstorage") || app.contains("downloads") ? "Phone storage" : app;
        String file = "";
        try (android.database.Cursor c = getContentResolver().query(u, new String[]{android.provider.OpenableColumns.DISPLAY_NAME}, null, null, null)) { if (c != null && c.moveToFirst()) file = c.getString(0); } catch (Exception e) { /* ignore */ }
        return name + (file.isEmpty() ? "" : " · " + file);
    }
    private void js(final String code) { runOnUiThread(() -> { if (web != null) web.evaluateJavascript(code, null); }); }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        String a = intent.getStringExtra("action");
        if (a != null) { pendingAction = a; js("window.__nativeAction&&window.__nativeAction()"); }
    }
    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        super.onActivityResult(req, res, data);
        if (req == REQ_CLOUD_SAVE || req == REQ_CLOUD_PICK) {
            Uri u = (res == RESULT_OK && data != null) ? data.getData() : null;
            if (u == null) { pendingCloudContent = null; js("window.__npCloud&&window.__npCloud('cancel','')"); return; }
            String where = describe(u);
            if (req == REQ_CLOUD_PICK) {
                try { getContentResolver().takePersistableUriPermission(u, Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION); } catch (Exception e) { /* provider may not allow - still try once */ }
                getSharedPreferences("np", MODE_PRIVATE).edit().putString("cloudUri", u.toString()).apply();
                js("window.__npCloud&&window.__npCloud('picked'," + org.json.JSONObject.quote(where) + ")");
            } else {
                String r = writeUri(u, pendingCloudContent == null ? "" : pendingCloudContent);
                pendingCloudContent = null;
                js("window.__npCloud&&window.__npCloud(" + org.json.JSONObject.quote(r.equals("ok") ? "saved" : "error") + "," + org.json.JSONObject.quote(r.equals("ok") ? where : r) + ")");
            }
            return;
        }
        if (req == REQ_FILE && fileCallback != null) {
            Uri u = (res == RESULT_OK && data != null) ? data.getData() : null;
            fileCallback.onReceiveValue(u == null ? null : new Uri[]{u});
            fileCallback = null;
        }
    }

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
        if (captureRecognizer != null) captureRecognizer.destroy();
        if (web != null) web.destroy();
        super.onDestroy();
    }
}
