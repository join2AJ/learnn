package com.nihongopath.app;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.os.Build;
import java.security.MessageDigest;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/** Derives the content key from the APK signing certificate (HMAC-SHA256 with a built-in pepper). */
final class ContentKey {
    private ContentKey() {}
    private static byte[] pepper() {
        // Built at runtime so it does not appear as a plain string in the APK.
        byte[] b = new byte[32];
        int x = 0x5A17C3E9;
        for (int i = 0; i < b.length; i++) { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; b[i] = (byte) (x ^ (i * 37 + 11)); }
        return b;
    }
    static String derive(Context c) {
        try {
            Signature[] sigs;
            if (Build.VERSION.SDK_INT >= 28) {
                PackageInfo pi = c.getPackageManager().getPackageInfo(c.getPackageName(), PackageManager.GET_SIGNING_CERTIFICATES);
                sigs = pi.signingInfo.getApkContentsSigners();
            } else {
                @SuppressWarnings("deprecation") PackageInfo pi = c.getPackageManager().getPackageInfo(c.getPackageName(), PackageManager.GET_SIGNATURES);
                sigs = pi.signatures;
            }
            byte[] cert = MessageDigest.getInstance("SHA-256").digest(sigs[0].toByteArray());
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(pepper(), "HmacSHA256"));
            mac.update(cert);
            mac.update(c.getPackageName().getBytes("UTF-8"));
            byte[] k = mac.doFinal();
            StringBuilder sb = new StringBuilder();
            for (byte v : k) sb.append(String.format("%02x", v));
            return sb.toString();
        } catch (Exception e) { return ""; }
    }
}
