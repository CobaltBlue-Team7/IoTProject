# Smart Bin
## Introduction
This is a project for Capstone Design course at Sogang university (CSE4186 & CSE4187) <br>
Our team's goal was to create IoT-based smart trash bin service. <br>
You can check more detailed information about this project in the following URLs.
- wiki page for CSE4186: http://bit.ly/2pcq3tL
- wiki page for CSE4187: http://bit.ly/2Am8JHR

## Project Components
The project consists of the following components.
1. Arduino code that collects data(distance to objects in trash bin) measured from sonar sensor attached to Nodemcu.<br>
   After collecting them, it calculates the the amount of trash in trash bin and sends it to Node.js server. 
   <b>[file: trash_bin.ino]</b>
2. Web application<br>
   2.1 Javascript code that receives data from trash_bin.ino and stores in MySQL database. 
   <b>[file: send.js]</b> <br>
   2.2 Javascript code that reads recent data for each trash bin from database and visualize how much each trash can is filled in. 
   <b>[file: main.js]</b>
3. Android application<br>
   Android project code(written in Java) that perform the following jobs.
   - Gets images of target indoor buildings from users.
   - Visualizes smart bins located on the positions specified initially by the users. <br>
     That is, the app shows images of colored smart bins in particular position according to how much they are filled. <br>
     To do that, the system reads data from MySQL database periodically and draws bitmaps on the display. <br>
     The color of the smart bins is determined by the amount of trash in the smart bin:
       - the amount of trash < 50% of the bin: <b>green</b>
       - the amount of trash < 70% of the bin: <b>yellow</b>
       - otherwise: <b>red</b>
