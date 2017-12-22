package com.davemorrissey.labs.subscaleview.test.extension.views;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.PointF;
import android.util.AttributeSet;
import android.util.Log;

import com.davemorrissey.labs.subscaleview.SubsamplingScaleImageView;
import com.davemorrissey.labs.subscaleview.test.MainActivity;
import com.davemorrissey.labs.subscaleview.test.R.drawable;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Arrays;


public class PinView extends SubsamplingScaleImageView {

    private final Paint paint = new Paint();
    private final PointF vPin = new PointF();
    public static int current_floor = 1;
    //private PointF sPin;
    public static PointF[] sPin = new PointF[1000];
    public static float pinWidth;
    public static float pinHeight;
    public static Bitmap[] pin = new Bitmap[3];
    public static int countPin = 0;
    public static Bitmap[] bmImage = new Bitmap[1000];    // store bitmaps
    public static PointF[] comparePin = new PointF[1000];   //

    public static int[] bin_id = new int[1000];
    public static double[] trash_amount = new double[1000];

    static int GREEN = 0, YELLOW = 1, RED = 2;
    public static int[] floor = new int[1000];


    public PinView(Context context, AttributeSet attr) {
        super(context, attr);
        initialise();

        Arrays.fill(bin_id, 0);
        try {
            // Get Trash Bin Status
            JSONArray status_json = new JSONArray(MainActivity.bin_status);
            for (int i = 0; i < status_json.length(); i++) {
                JSONObject status_object = status_json.getJSONObject(i);

                bin_id[i] = status_object.getInt("bin_id");
                trash_amount[bin_id[i]] = status_object.getDouble("trash_amount");
            }

            // Get Trash Bin Location
            JSONArray loc_json = new JSONArray(MainActivity.bin_loc);
            for (int i = 0; i < loc_json.length(); i++) {
                JSONObject loc_object = loc_json.getJSONObject(i);

                bin_id[i] = loc_object.getInt("bin_id");
                floor[bin_id[i]] = loc_object.getInt("floor");
                sPin[bin_id[i]] = new PointF(Float.parseFloat(loc_object.getString("pos_x")), Float.parseFloat(loc_object.getString("pos_y")));

                countPin += 1;
            }

        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    public void setPin(PointF sPin, PointF cPin, int new_bin_id) {
        //this.sPin = sPin;
        if(new_bin_id != -1) {
            this.sPin[new_bin_id] = sPin;
            this.comparePin[new_bin_id] = cPin;
        }
        initialise();
        invalidate();
    }

    private void initialise() {
        float density = getResources().getDisplayMetrics().densityDpi;
        //pin = BitmapFactory.decodeResource(this.getResources(), drawable.pushpin_blue);
        float w, h;

        pin[GREEN] = BitmapFactory.decodeResource(this.getResources(), drawable.bin_green);
        w = (density / 3020f) * pin[0].getWidth();
        h = (density / 3020f) * pin[0].getHeight();
        pin[GREEN] = Bitmap.createScaledBitmap(pin[GREEN], (int) w, (int) h, true);

        pin[YELLOW] = BitmapFactory.decodeResource(this.getResources(), drawable.bin_yellow);
        pin[YELLOW] = Bitmap.createScaledBitmap(pin[YELLOW], (int) w, (int) h, true);

        pin[RED] = BitmapFactory.decodeResource(this.getResources(), drawable.bin_red);
        pin[RED] = Bitmap.createScaledBitmap(pin[RED], (int) w, (int) h, true);

        pinWidth = w;
        pinHeight = h;
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        // Don't draw pin before image is ready so it doesn't move around during setup.
        if (!isReady()) {
            return;
        }

        paint.setAntiAlias(true);
        /*
        if (sPin != null && pin != null) {
            //sourceToViewCoord(sPin, vPin);
            //float vX = vPin.x - (pin.getWidth()/2);
            //float vY = vPin.y - pin.getHeight();
            canvas.drawBitmap(pin, sPin.x - 30.0f, sPin.y - 230.0f, paint);
        }*/
        for( int i = 0; i < bin_id.length; i++) {

            if (sPin[bin_id[i]] != null && current_floor == floor[bin_id[i]]) {
                //sourceToViewCoord(sPin, vPin);
                //float vX = vPin.x - (pin.getWidth()/2);
                //float vY = vPin.y - pin.getHeight();
                Log.w("PinView ", "Here!");
                sourceToViewCoord(sPin[bin_id[i]], vPin);
                float vX = vPin.x - (pin[0].getWidth()/2);
                float vY = vPin.y - pin[0].getHeight();

                int bin_state_color;
                if (trash_amount[bin_id[i]] < 0.5f)
                    bin_state_color = GREEN;
                else if (trash_amount[bin_id[i]] < 0.7f)
                    bin_state_color = YELLOW;
                else
                    bin_state_color = RED;

                bmImage[bin_id[i]] = pin[bin_state_color];

                //canvas.drawBitmap(pin[bin_state_color], sPin[bin_id[i]].x - 30.0f, sPin[bin_id[i]].y - 230.0f, paint);
                //canvas.drawBitmap(pin[bin_state_color], sPin[bin_id[i]].x - 30.0f, sPin[bin_id[i]].y - 230.0f, paint);
                canvas.drawBitmap(pin[bin_state_color], vX, vY, paint);
            }
        }
    }

}
