<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <link rel="stylesheet" href="styles.css">
  <script src="la_color_picker.js" defer></script>
  <script src="script.js" defer></script>
  <link rel="preconnect" href="https://fonts.gstatic.com">
<link href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300&display=swap" rel="stylesheet">
  <title>DraGantt - Drag & Drop scheduler</title>
</head>
<body>
    <div id="tod" class="today">
        <!--<div class="tdtxt">TODAY</div>-->
    </div>
  <div class="weeks">
      <div id="fweek"class="oneweek" draggable="false"></div>

  </div>
  <div id="timeline_cointainer" class="first">
      <div id="timeline0" class="container"></div>
      <span id= "timeline_txt_0" class="hooked">TIMELINE 0</span>
      <div id="timeline" class="container"></div>
      <span class="hooked">TIMELINE 1</span>
      <div id="timeline1" class="container"></div>
      <span class="hooked">TIMELINE 2</span>
      <div id="trashcan" class="container trash"></div>
      <span class="hooked">TRASH CAN LINE</span>
  </div>
  <div id="navi_cointainer" >
      <div class="sourcecontainer">
        <div id="enew" class="draggable fresh" draggable="true">Void</div>
        <div id="tnew" class="draggable fresh" draggable="true">New</div>
      </div>

      <div class="terminal">
          <div id="bufor" class="container short"></div>
          <span>Bufor</span>
          <br>
           <div class="tleft">
               <h3 id="updatePanel">Add task:</h3>
               Task name:
               <br>
               <input type=text id="activeName"></input>
               <br>
               Task duration [days]:
               <br>
               <input type=text id="activeDuration" size="8"></input>
            <button id="activeDn">-</button>
            <button id="activeUp">+</button>
           <br>
           Task color:
           <br>
           <input type=text id="activeColor" size="8"></input>
           <button id="activeUpdate" class="savebtn">Add Task</button>
           <br>
           <div class="palette" id="colorPalette"></div>

           </div>
          <div class="tleft">
              <div id="kcolaps" class="hidden">
            Text console, for data input/output
            <br>
            <textarea id="konsola" name="konsola" rows="4" cols="50">
            </textarea>
            <br>
            <button id="grabdata">Make Tasks from Text</button>
            <button id="getastext">Read Timelines to Text</button>
            <br>
            <button id="clearAllBtn">Clear All Timelies!</button>
            <br>
            <button id="cleartrash">Empty Trash Line</button>
            <br>
            <input id="fileinput" type="file" name="name" accept=".txt, .gantt, /text.*" style="display: none;"></input>
            <br>
            </div>
            <button id="loadfilebutton" class="savebtn loadbtn">Load and Add</button>
            <button id="savefilebutton" class="savebtn">Save to File</button>
              <button id="toggler">Show</button>

           </div>
      </div>
  </div>
  <div>
  </div>
</body>
</html>
