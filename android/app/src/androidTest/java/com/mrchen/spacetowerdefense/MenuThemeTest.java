package com.mrchen.spacetowerdefense;

import static org.junit.Assert.*;
import android.app.Activity;
import android.app.Instrumentation;
import android.content.Intent;
import android.content.res.TypedArray;
import android.widget.TextView;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class MenuThemeTest {
    @Test public void nativeMenuRowsNeverInheritLaunchArtwork() {
        Instrumentation instrumentation = InstrumentationRegistry.getInstrumentation();
        Intent intent = new Intent(instrumentation.getTargetContext(), MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        Activity activity = instrumentation.startActivitySync(intent);
        try {
            instrumentation.runOnMainSync(() -> {
                // Test the real Activity after BridgeActivity switches themes.
                TextView row = new TextView(activity);
                assertNull("Native rows must not inherit the splash drawable", row.getBackground());
                TypedArray colors = activity.obtainStyledAttributes(new int[] {
                    android.R.attr.colorBackground, android.R.attr.textColorPrimary
                });
                try {
                    assertEquals(0xFF071B30, colors.getColor(0, 0));
                    assertEquals(0xFFF3F8FC, colors.getColor(1, 0));
                } finally { colors.recycle(); }
            });
        } finally { activity.finish(); }
    }
}
