# Keep the JavaScript bridge methods callable from the WebView.
-keepclassmembers class com.nihongopath.app.MainActivity$Bridge { @android.webkit.JavascriptInterface <methods>; }
-keepattributes JavascriptInterface
