package com.davemorrissey.labs.subscaleview.test;

import android.os.AsyncTask;
import android.util.Log;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

import javax.net.ssl.HttpsURLConnection;

public class GetStatus extends AsyncTask<Void, Void, String> {

    protected void onPreExecute(){}

    protected String doInBackground(Void... params) {

        try {

            // Set connection
            URL url = new URL("http://52.79.145.186/get_status.php");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoInput(true);

            // Send POST request and save http response status
            int responseCode = conn.getResponseCode();

            // Check http response status and get data
            if (responseCode == HttpsURLConnection.HTTP_OK) {

                BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line;

                while((line = in.readLine()) != null) {
                    sb.append(line);
                }

                in.close();

                return sb.toString();
            }
            else {
                return "False: " + responseCode;
            }
        }
        catch(Exception e){
            return "Exception: " + e.getMessage();
        }
    }

    @Override
    protected void onPostExecute(String result) {
        //Toast.makeText(getApplicationContext(), result, Toast.LENGTH_LONG).show();
        Log.i("GetStatus: ", result);
        super.onPostExecute(result);
    }
}