package com.davemorrissey.labs.subscaleview.test.extension;

import android.app.Activity;
import android.os.Bundle;

import com.davemorrissey.labs.subscaleview.test.GetLog;
import com.davemorrissey.labs.subscaleview.test.MakeGraphData;
import com.davemorrissey.labs.subscaleview.test.R;
import com.jjoe64.graphview.GraphView;
import com.jjoe64.graphview.series.DataPoint;
import com.jjoe64.graphview.series.LineGraphSeries;

/**
 * Created by byungsoo on 2017. 12. 12..
 */

public class GraphActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.graph_activity);

        String bin_id = getIntent().getStringExtra("bin_id");

        String result = null;

        try {
            result = new GetLog().execute(bin_id).get();
        } catch (Exception e){
            e.printStackTrace();
        }

        DataPoint[] test = new MakeGraphData(result).getGraphData();

        GraphView graph = (GraphView) findViewById(R.id.graph);

        LineGraphSeries<DataPoint> series = new LineGraphSeries<>(test);
        graph.addSeries(series);
    }
}
