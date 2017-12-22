package com.davemorrissey.labs.subscaleview.test.extension;

import android.content.Intent;
import android.graphics.Color;
import android.graphics.PointF;
import android.graphics.Typeface;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.davemorrissey.labs.subscaleview.ImageSource;
import com.davemorrissey.labs.subscaleview.test.DeleteData;
import com.davemorrissey.labs.subscaleview.test.GetStatus;
import com.davemorrissey.labs.subscaleview.test.MainActivity;
import com.davemorrissey.labs.subscaleview.test.PutLocation;
import com.davemorrissey.labs.subscaleview.test.R;
import com.davemorrissey.labs.subscaleview.test.R.id;
import com.davemorrissey.labs.subscaleview.test.R.layout;
import com.davemorrissey.labs.subscaleview.test.extension.views.PinView;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Arrays;

import static com.davemorrissey.labs.subscaleview.test.extension.views.PinView.bin_id;
import static com.davemorrissey.labs.subscaleview.test.extension.views.PinView.sPin;

public class ExtensionPinFragment extends Fragment {
    private PinView imageView;
    private boolean gen_flag;
    private boolean del_flag;
    Button AddTrashBin;
    Button DeleteTrashBin;
    Button F1;
    Button F2;
    final View rootView = null;
    private boolean[] binClicked = new boolean[1000];
    private double MAX_DIST = 9999999.0f;
    int minIdx = -1;
    Button refreshButton;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        final View rootView = inflater.inflate(layout.extension_pin_fragment, container, false);

        imageView = rootView.findViewById(id.imageView);
        imageView.setImage(ImageSource.asset("dcube_f1.JPG"));

        AddTrashBin = rootView.findViewById(id.AddTrash);

        AddTrashBin.setOnClickListener(ClickListener);
        DeleteTrashBin = rootView.findViewById(id.DeleteTrash);

        refreshButton = rootView.findViewById(id.refresh);
        refreshButton.setOnClickListener(ClickListener6);

        /* create views for buttons and their onClickListeners */
        F1 = rootView.findViewById(id.floor1);
        F2 = rootView.findViewById(id.floor2);

        AddTrashBin.setOnClickListener(ClickListener);
        DeleteTrashBin.setOnClickListener(ClickListener2);
        F1.setOnClickListener(ClickListener3);
        F2.setOnClickListener(ClickListener4);

        Arrays.fill(binClicked, Boolean.FALSE);

        imageView.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View v, MotionEvent event) {
                // TODO Auto-generated method stub
                String result;

                int action = event.getAction();
                float x = event.getRawX();
                float y = event.getRawY();

                //float modifiedX = x * 0.65f-20f;
                //float modifiedY = y * 1.0035f-275f;
                float modifiedX = x * 0.65f-20f;
                float modifiedY = y * 1.0035f-275f;

                // Create New Bin
                if (action == MotionEvent.ACTION_DOWN && gen_flag) {
                    Log.i("touch!", "imageView1 onTouch");
                    Log.i("View X,Y", "x: " + x + ", y:" + y);

                    // Find empty bin ID
                    int new_bin_id = 0;
                    for (int i = 1; i < 1000; i++) {
                        if (sPin[i] == null) {
                            new_bin_id = i;
                            break;
                        }
                        Log.w("Accupied bin", "" + i);
                    }
                    Log.w("New Bin", "" + new_bin_id);

                    // set Pin

                    //imageView.setPin(new PointF(x, y), new_bin_id);
                    imageView.setPin(new PointF(modifiedX, modifiedY), new PointF(x, y), new_bin_id);

                    try{
                        //result = new PutLocation().execute(String.valueOf(new_bin_id), "1", String.valueOf(x), String.valueOf(y)).get();
                        result = new PutLocation().execute(String.valueOf(new_bin_id), String.valueOf(PinView.current_floor), String.valueOf(modifiedX), String.valueOf(modifiedY)).get();
                        PinView.floor[new_bin_id] = PinView.current_floor;
                    } catch (Exception e){
                        e.printStackTrace();
                    }

                    PinView.countPin += 1;
                    gen_flag = false;
                    AddTrashBin.setEnabled(true);
                }
                // General Touching action
                else if(action == MotionEvent.ACTION_DOWN) {
                    int cntPin = PinView.countPin;
                    float clickedX = modifiedX;
                    float clickedY = modifiedY;
                    //float clickedX = x;
                    //float clickedY = y - 450.0f;

                    Log.i("touch!", "cntPin: " + cntPin);
                    //Log.w("(X, Y)", "X: " + x + " Y: " + y);
                    Log.i("*** (mX, mY) ***", "mX: " + clickedX + "mY: " + clickedY);
                    Log.i("*** (width, height) ***", "width: " + PinView.pinWidth + ", height: " + PinView.pinHeight);
                    double minDist = MAX_DIST, dist = MAX_DIST;

                    for(int i = 0; i < bin_id.length && bin_id[i] != 0; i++) {
                        //Log.i("***  ***", "[#" + i + "] bin_id" + PinView.bin_id[i]);
                        if(sPin[bin_id[i]] != null) {
                            float bitmapXPosition = sPin[bin_id[i]].x;
                            float bitmapYPosition = sPin[bin_id[i]].y;
                            Log.i("*** (bX, bY) ***", "[#" + bin_id[i] + "] bX: " + bitmapXPosition + "bY: " + bitmapYPosition);

                            //if (bitmapXPosition > clickedX - 50.0f && bitmapXPosition < clickedX + 50.0f && bitmapYPosition > clickedY - 50.0f && bitmapYPosition < clickedY + 50.0f) {
                            //if (clickedX > bitmapXPosition - PinView.pinWidth/2 && clickedX < bitmapXPosition + PinView.pinWidth/2 &&
                            //        clickedY > bitmapXPosition - PinView.pinHeight/2 && clickedY < bitmapYPosition + PinView.pinHeight/2) {
                            //if (clickedX > bitmapXPosition - PinView.pinWidth && clickedX < bitmapXPosition + PinView.pinWidth &&
                            //        clickedY > bitmapXPosition - PinView.pinHeight && clickedY < bitmapYPosition + PinView.pinHeight) {
                            dist = Math.sqrt(Math.pow((double)(clickedX-bitmapXPosition), (double)2.0) + Math.pow((double)(clickedY-bitmapYPosition), (double)2.0));
                            if(dist < minDist && PinView.current_floor == PinView.floor[bin_id[i]]) {
                                // Bitmap touched
                                Log.w("*** Bitmap touched ***", "***************** dist: " + dist + "*******************");
                                minDist = dist;
                                minIdx = bin_id[i];
                            }
                        }

                        //if (bitmapXPosition > x - 100.0f && bitmapXPosition < x + 100.0f && bitmapYPosition > y - 200.0f && bitmapYPosition < y + 200.0f) {
                            // Bitmap touched
                         //   Log.w("*** Bitmap touched ***", "bitmap #" + i);
                        //}
                    }
                    if(minIdx != -1 && minDist < 55.0f) {  // 특정 쓰레기통이 클릭 되었음을 나타냄
                        Log.w("*** Bitmap touched ***", "minDist: " + minDist + ", dist: " + dist);
                        Log.w("*** Bitmap touched ***", "***************** minIdx: " + minIdx + "*******************");
                        if(del_flag) {
                            Log.w("... Deleting ...", "bitmap #" + minIdx);
                            //PinView.sPin[minIdx].x = PinView.sPin[minIdx].y = -1.0f;
                            PinView.bmImage[minIdx].recycle();
                            PinView.bmImage[minIdx] = null;
                            PinView.sPin[minIdx] = null;

                            x = y = -1.0f;
                            imageView.setPin(new PointF(x, y), new PointF(x, y), -1);
                            Log.w("here(1)", "deleting");
                            del_flag = false;
                            // delete dialog
                            DeleteTrashBin.setEnabled(true);
                            RelativeLayout rLayout = (RelativeLayout) rootView.findViewById(id.pinLayout);
                            ImageView configImage = (ImageView)rLayout.findViewById(minIdx);
                            rLayout.removeView(configImage);
                            Log.w("here(2)", "deleting");
                            TextView configText = (TextView)rLayout.findViewById(minIdx*1000);
                            rLayout.removeView(configText);
                            binClicked[minIdx] = false;
                            //

                            try {
                                String test;
                                test = new DeleteData().execute(String.valueOf(minIdx)).get();
                            }catch (Exception e){
                                e.printStackTrace();
                            }
                        }
                        else {
                            // TODO: show information about the clicked bin
                            RelativeLayout rLayout = null;
                            TextView tv1 = null;
                            ImageView baloon = null;
                            Button showDetail = null;
                            Log.w("before!!", "!!!");
                            if(!binClicked[minIdx]) {
                                    /* draw a dialog */
                                Log.w("*** click handling ***", "show a dialog");
                                if(sPin[minIdx] == null)
                                    Log.w("Error!", "null!");
                                else {
                                    float bitmapXPosition = sPin[bin_id[minIdx]].x;
                                    float bitmapYPosition = sPin[bin_id[minIdx]].y;

                                    //Log.w("(cX, cY)", "cX: " + PinView.comparePin[minIdx].x + " cY: " + PinView.comparePin[minIdx].y);
                                    //if(PinView.comparePin[minIdx].x == -1.0f && PinView.comparePin[minIdx].y == -1.0f)
                                    rLayout = (RelativeLayout) rootView.findViewById(id.pinLayout);
                                    RelativeLayout.LayoutParams lparams = new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.WRAP_CONTENT, RelativeLayout.LayoutParams.WRAP_CONTENT);

                                    baloon = new ImageView(getContext());
                                    baloon.setBackgroundResource(R.drawable.baloon);
                                    baloon.setId(minIdx);
                                    final PointF vPin = new PointF();
                                    imageView.sourceToViewCoord(sPin[bin_id[minIdx]], vPin);
                                    float vX = vPin.x - (PinView.pin[0].getWidth()/2);
                                    float vY = vPin.y - PinView.pin[0].getHeight();

                                    baloon.setX(x);
                                    baloon.setY(y-470.0f);
                                    rLayout.addView(baloon);

                                    tv1 = new TextView(getContext());
                                    tv1.setId(minIdx * 1000);
                                    tv1.setText("Bin ID: " + minIdx);
                                    tv1.setX(x + 25.0f);
                                    tv1.setY(y - 450.0f);
                                    //tv1.setBackgroundColor(Color.rgb(0, 0, 0));
                                    tv1.setTextSize(20);
                                    tv1.setTextColor(Color.rgb(0, 0, 0));
                                    tv1.setTypeface(tv1.getTypeface(), Typeface.BOLD);
                                    //tv1.setWidth(500);
                                    rLayout.addView(tv1);

                                    showDetail = new Button(getContext());
                                    showDetail.setId(minIdx * 10000);
                                    showDetail.setText("Graph");
                                    showDetail.setScaleX(0.6f);
                                    showDetail.setScaleY(0.8f);
                                    showDetail.setBackgroundColor(Color.rgb(255, 255, 255));
                                    showDetail.setTextColor(Color.rgb(0, 0, 0));
                                    showDetail.setX(x - 10.0f);
                                    showDetail.setY(y - 390.0f);
                                    showDetail.setTextSize(35);
                                    showDetail.setTypeface(showDetail.getTypeface(), Typeface.BOLD);
                                    showDetail.setOnClickListener(ClickListener5);
                                    rLayout.addView(showDetail);

                                    binClicked[minIdx] = true;
                                }
                            }
                            else {
                                    /* remove a dialog */
                                Log.w("*** Remove view ***", "delete a dialog");
                                rLayout = (RelativeLayout) rootView.findViewById(id.pinLayout);
                                ImageView configImage = (ImageView)rLayout.findViewById(minIdx);
                                rLayout.removeView(configImage);
                                TextView configText = (TextView)rLayout.findViewById(minIdx*1000);
                                rLayout.removeView(configText);
                                Button configButton = (Button)rLayout.findViewById(minIdx*10000);
                                rLayout.removeView(configButton);
                                binClicked[minIdx] = false;
                            }
                        }
                    }

                    /*Log.w("Bitmap touched", "bitmap #" );
                    for(int i = 0; i < PinView.bin_id.length; i++) {
                        if(PinView.sPin[PinView.bin_id[i]] != null) {
                            float bitmapXPosition = PinView.comparePin[PinView.bin_id[i]].x;
                            float bitmapYPosition = PinView.comparePin[PinView.bin_id[i]].y;
                            if (bitmapXPosition > x - 100.0f && bitmapXPosition < x + 100.0f && bitmapYPosition > y - 200.0f && bitmapYPosition < y + 200.0f) {
                                // Bitmap touched
                                Log.w("*** Bitmap touched ***", "bitmap #" + i);
                            }
                        }
                    }*/
                }
                return false;
            }
        });
        //imageView.setPin(new PointF(1718f, 581f));
        return rootView;
    }

    Button.OnClickListener ClickListener = new View.OnClickListener() {
        @Override
        public void onClick(View view) {
            gen_flag = true;
            AddTrashBin.setEnabled(false);
        }
    };

    Button.OnClickListener ClickListener2 = new View.OnClickListener() {
        @Override
        public void onClick(View view) {
            del_flag = true;
            DeleteTrashBin.setEnabled(false);
        }
    };

    Button.OnClickListener ClickListener3 = new View.OnClickListener() {
        @Override
        public void onClick(View view) {
            imageView.setImage(ImageSource.asset("dcube_f1.JPG"));

            PinView.current_floor = 1;
            /*RelativeLayout rLayout = (RelativeLayout) rootView.findViewById(id.pinLayout);
            int cnt = PinView.countPin;
            for(int i = 0; i < cnt; i++) {
                ImageView configImage = (ImageView) rLayout.findViewById(i);
                rLayout.removeView(configImage);
                TextView configText = (TextView) rLayout.findViewById(i * 1000);
                rLayout.removeView(configText);
                binClicked[i] = false;
            }*/
        }
    };

    Button.OnClickListener ClickListener4 = new View.OnClickListener() {
        @Override
        public void onClick(View view) {
            imageView.setImage(ImageSource.asset("2f.jpeg"));
            PinView.current_floor = 2;
            /*RelativeLayout rLayout = (RelativeLayout) rootView.findViewById(id.pinLayout);
            int cnt = PinView.countPin;
            for(int i = 0; i < cnt; i++) {
                ImageView configImage = (ImageView) rLayout.findViewById(i);
                rLayout.removeView(configImage);
                TextView configText = (TextView) rLayout.findViewById(i * 1000);
                rLayout.removeView(configText);
                binClicked[i] = false;
            }*/
        }
    };

    Button.OnClickListener ClickListener5 = new View.OnClickListener() {
        @Override
        public void onClick(View view) {
            Intent intent = new Intent(getActivity(), GraphActivity.class);
            intent.putExtra("bin_id", String.valueOf(minIdx));
            startActivity(intent);
        }
    };

    Button.OnClickListener ClickListener6 = new View.OnClickListener() {
        @Override
        public void onClick(View view) {
            try {
                MainActivity.bin_status = new GetStatus().execute().get();
                // Get Trash Bin Status
                JSONArray status_json = new JSONArray(MainActivity.bin_status);
                for (int i = 0; i < status_json.length(); i++) {
                    JSONObject status_object = status_json.getJSONObject(i);

                    bin_id[i] = status_object.getInt("bin_id");
                    PinView.trash_amount[bin_id[i]] = status_object.getDouble("trash_amount");
                }

                // Get Trash Bin Location
                /*JSONArray loc_json = new JSONArray(MainActivity.bin_loc);
                for (int i = 0; i < loc_json.length(); i++) {
                    JSONObject loc_object = loc_json.getJSONObject(i);

                    //bin_id[i] = loc_object.getInt("bin_id");
                    PinView.floor[bin_id[i]] = loc_object.getInt("floor");
                    sPin[bin_id[i]] = new PointF(Float.parseFloat(loc_object.getString("pos_x")), Float.parseFloat(loc_object.getString("pos_y")));
                    //PinView.countPin += 1;
                }*/

            } catch (Exception e) {
                e.printStackTrace();
            }
            float x = -1.0f, y = -1.0f;
            imageView.setPin(new PointF(x, y), new PointF(x, y), -1);
        }
    };
}