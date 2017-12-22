package com.davemorrissey.labs.subscaleview.test;

import com.jjoe64.graphview.series.DataPoint;

import org.json.JSONArray;
import org.json.JSONObject;


public class MakeGraphData {

    private DataPoint[] graphData;

    public MakeGraphData(String jsonString){

        JSONArray jsonArray;
        JSONObject jsonObject;

        try{
            jsonArray = new JSONArray(jsonString);
            graphData = new DataPoint[jsonArray.length()];

            for(int i=0; i<jsonArray.length(); i++){
                jsonObject = jsonArray.getJSONObject(i);
                float value = Float.parseFloat(jsonObject.getString("trash_amount"));

                graphData[i] = new DataPoint(i, value);
            }
        } catch(Exception e){
            e.printStackTrace();
        }
    }

    public DataPoint[] getGraphData(){
        return graphData;
    }
}
