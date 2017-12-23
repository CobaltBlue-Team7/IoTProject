# Android Application for Managing Smart Bins.

## Note: referenced an existing open source to handle pinch zoom on ImageView
This Android project is based on the open source project named "Subsampling Scale Image View".<br>
The link for "Subsampling Scale Image View" is as follows: https://github.com/davemorrissey/subsampling-scale-image-view<br>
We partly used this project's image handling libraries, particularly when we had to implement pinch zoom operation for ImageView.<br>

## Key Implementations
- Visualization of real-time smart bin data is implemented in 
  * IoTProject/smart-bin/sample/src/main/.../test/extension/<b>ExtensionPinFragment.java</b>
  * IoTProject/smart-bin/sample/src/main/.../test/extension/<b>GraphActivity.java</b>
  * IoTProject/smart-bin/sample/src/main/.../test/extension/views/<b>PinView.java</b>

- Interaction with Mysql database is implemented in
  * IoTProject/smart-bin/sample/src/main/.../test/<b>GetLocation.java</b>
  * IoTProject/smart-bin/sample/src/main/.../test/<b>PutLocation.java</b>
  * IoTProject/smart-bin/sample/src/main/.../test/<b>GetStatus.java</b>

## How It Works
Note that you first have to set up database and connect to it via PHP
