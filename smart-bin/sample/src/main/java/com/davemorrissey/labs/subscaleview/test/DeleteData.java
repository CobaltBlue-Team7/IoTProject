package com.davemorrissey.labs.subscaleview.test;

import android.os.AsyncTask;
import android.util.Log;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

import javax.net.ssl.HttpsURLConnection;


public class DeleteData extends AsyncTask<String, Void, String> {

    protected void onPreExecute(){}

    protected String doInBackground(String... params) {

        try {

            // Set connection
            URL url = new URL("http://52.79.145.186/delete_data.php");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoInput(true);
            conn.setDoOutput(true);

            // Make JSON Object
            JSONObject jsonQuery = new JSONObject();
            jsonQuery.put("bin_id", params[0]);

            // Write json data to output stream
            DataOutputStream out = new DataOutputStream(conn.getOutputStream());
            out.writeBytes(jsonQuery.toString());
            out.flush();
            out.close();

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
        Log.i("DeleteData: ", result);
        super.onPostExecute(result);
    }
}