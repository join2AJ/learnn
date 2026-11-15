package com.nihongopath.app;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import java.util.Calendar;

/**
 * Reminder for scheduled backups. The learner's data lives inside the WebView, so the backup itself
 * runs in the app: this alarm shows a notification, and tapping it opens the app which saves the file.
 */
public class BackupReminder extends BroadcastReceiver {
    static final String PREFS = "backup_schedule", CHANNEL = "backup";

    @Override
    public void onReceive(Context ctx, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) { reschedule(ctx); return; }
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel(CHANNEL) == null)
            nm.createNotificationChannel(new NotificationChannel(CHANNEL, "Backups", NotificationManager.IMPORTANCE_DEFAULT));
        Intent open = new Intent(ctx, MainActivity.class).putExtra("action", "backup").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pi = PendingIntent.getActivity(ctx, 7, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(ctx, CHANNEL) : new Notification.Builder(ctx);
        b.setSmallIcon(android.R.drawable.stat_sys_download_done).setContentTitle("Time to back up Nihongo Path")
         .setContentText("Tap to save your progress to Downloads/NihongoPath").setAutoCancel(true).setContentIntent(pi);
        try { nm.notify(71, b.build()); } catch (SecurityException ignored) { }
    }

    /** weekday: -1 = every day, 1..7 = Calendar.SUNDAY..SATURDAY (weekly). */
    static void schedule(Context ctx, int hour, int minute, int weekday) {
        ctx.getSharedPreferences(PREFS, 0).edit().putBoolean("on", true).putInt("h", hour).putInt("m", minute).putInt("d", weekday).apply();
        Calendar c = Calendar.getInstance();
        c.set(Calendar.HOUR_OF_DAY, hour); c.set(Calendar.MINUTE, minute); c.set(Calendar.SECOND, 0);
        if (weekday > 0) c.set(Calendar.DAY_OF_WEEK, weekday);
        long interval = weekday > 0 ? AlarmManager.INTERVAL_DAY * 7 : AlarmManager.INTERVAL_DAY;
        while (c.getTimeInMillis() <= System.currentTimeMillis()) c.setTimeInMillis(c.getTimeInMillis() + interval);
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        am.setInexactRepeating(AlarmManager.RTC_WAKEUP, c.getTimeInMillis(), interval, pending(ctx));
    }
    static void cancel(Context ctx) {
        ctx.getSharedPreferences(PREFS, 0).edit().putBoolean("on", false).apply();
        ((AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE)).cancel(pending(ctx));
    }
    static void reschedule(Context ctx) {
        SharedPreferences p = ctx.getSharedPreferences(PREFS, 0);
        if (p.getBoolean("on", false)) schedule(ctx, p.getInt("h", 21), p.getInt("m", 0), p.getInt("d", -1));
    }
    private static PendingIntent pending(Context ctx) {
        return PendingIntent.getBroadcast(ctx, 8, new Intent(ctx, BackupReminder.class), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
}
