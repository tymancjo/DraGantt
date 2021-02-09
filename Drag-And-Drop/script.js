const colors = ['#28559a','#3778c2','#4b9fe1','#63bce5','#7ed5eaj','#9cf6fb','#e1fcfd','#394f8a','#4a5fc1','#e5b9a8','#ead6cd'];

let allTasks0 = [];
let allTasks  = [];
let allTasks1 = [];

let draggables      = document.querySelectorAll('.draggable');
let activeTask      = null;
let activeTimeline  = null;
let activeId        = null;

const containers    = document.querySelectorAll('.container');
const calendar      = document.querySelectorAll('.weeks')[0];
const zasobnik      = document.querySelectorAll('.sourcecontainer')[0];
const grabdata      = document.getElementById('grabdata');
const konsola       = document.getElementById('konsola');

const oneweek       = document.getElementById('fweek');
const timeline0     = document.getElementById('timeline0');
const timeline      = document.getElementById('timeline');
const tnew          = document.getElementById('tnew');
const enew          = document.getElementById('enew');
const aName         = document.getElementById('activeName');
const aDuration     = document.getElementById('activeDuration');
const aColor        = document.getElementById('activeColor');
const tod           = document.getElementById('tod');
const updateButton  = document.getElementById('activeUpdate');
const loadfile      = document.getElementById('fileinput');
const preloadeddata = document.getElementById('preloadeddata');
const kcolaps       = document.getElementById('kcolaps');

let Tasks           = [allTasks0, allTasks, allTasks1];
let Timelines       = [timeline0, timeline, timeline1];

// Dynamically creating timelines routine


// binding action to resize scroll and so on event
window.addEventListener('resize', refreshTimeline);

// binding click listener globally
document.addEventListener('click', function(e) {
    e = e || window.event;
    var target = e.target || e.srcElement;
    makeActive(target);
}, false);

// binding the action to the button
grabdata.addEventListener('click', grabDataFromConsole);
getastext.addEventListener('click', grabDataToConsole);
cleartrash.addEventListener('click', clearTrash);
loadfile.addEventListener('change', loadFromExternalFile);
loadfilebutton.addEventListener('click', ()=>{loadfile.click();});
savefilebutton.addEventListener('click', download );

clearAllBtn.addEventListener('click', ()=>{
    var r = confirm("Confirm deleting all tasks!");
    if (r){
        clearAll();
        readFrom();
        activeId = null;
        activeTimeline = null;
        activeTask = null;
        updateButton.innerHTML = 'Add Task';
        document.getElementById('updatePanel').innerHTML = 'Add Task:'
    } 
} );

// panel buttons actions binding
activeUpdate.addEventListener('click', ()=> {updateActive(0)});
activeUp.addEventListener('click', () => {updateActive(1)});
activeDn.addEventListener('click', () => {updateActive(-1)});
toggler.addEventListener('click', toggleKonsola);

// some variables
let konsolaState = false;

function toggleKonsola(){
    console.log("coś tam robię")
    if ( konsolaState ) {
        kcolaps.classList.add('hidden');
        toggler.innerText = "Show";
    } else {
       kcolaps.classList.remove('hidden');
        toggler.innerText = "Hide";
    }
    konsolaState = !konsolaState;
}

// creating the calendar for weeks
const isNow = new Date();
const curretnWeek = getWeekNumber(isNow)[1];
let dayOfWeek = isNow.getDay();
if(dayOfWeek > 5) dayOfWeek = 5; // just using work days
console.log(curretnWeek + "//" + dayOfWeek);

calendar.removeChild(oneweek);

let yearStart = dayOfYear(1).getDay();
let dayShift = 0;
if (yearStart > 4) dayShift = 1 + (8 - yearStart);
console.log("Start : " + yearStart + "  "+ dayShift);

for (let i=1; i < 53; i++){
    let newweek = oneweek.cloneNode(true);
    let weekStartDate = dayOfYear(dayShift + (i-1)*7);
    console.log(i + "<br>" + weekStartDate.toLocaleDateString());

    newweek.innerHTML = i + "<br>" + weekStartDate.toLocaleDateString();
    if (i < curretnWeek) newweek.classList.add('pastWeek');
    if (i == curretnWeek) newweek.classList.add('currentWeek');
    calendar.appendChild(newweek);
}

        let w1 = document.querySelectorAll('.oneweek')[1].clientWidth - 2;
        let d = curretnWeek - 1 + dayOfWeek  / 5;
        let addendum = 2*Math.floor(d) -1;
        if (addendum <= 0) addendum = 0;
        let sizeTxt = Math.floor(addendum + 1.0 * d* w1 ) + "px";
        tod.style.marginLeft = sizeTxt;

// reading some data from default file from server
loadFileAndPrintToConsole('default.gantt');
//readTextFile('./def.data');

draggables.forEach(element => {
    let w1 = document.querySelectorAll('.oneweek')[1].clientWidth - 2;
    let sizeTxt = w1 + 'px'
    element.style.width = sizeTxt;
})

makeSetup();

containers.forEach(container => {
  container.addEventListener('dragover', e => {
    e.preventDefault()
    const afterElement = getDragAfterElement(container, e.clientX)
    const draggable = document.querySelector('.dragging')

    if (afterElement == null) {
        container.appendChild(draggable)
    } else {
      container.insertBefore(draggable, afterElement)
    }
  })
})

function getDragAfterElement(container, x) {
  const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')]
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect()
    const offset = x - box.left - box.width / 2
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child }
    } else {
      return closest
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element
}

async function loadFileAndPrintToConsole(url) {
  try {
    const response = await fetch(url);
    const data = await response.text();
    console.log(data);
    konsola.value = data;
    grabDataFromConsole();

  } catch (err) {
    console.error(err);
  }
}

function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                alert(allText);
            }
        }
    }
    rawFile.send(null);
}

function grabDataToConsole(){
    konsola.value = "";
    Tasks.forEach((tsk,i)=>{
        konsola.value += tasksToText(tsk, i);
    })
}

function grabDataFromConsole(){

    let allText = konsola.value.trim();
    if (allText != ""){
        results = allText.split(/\r?\n/);

        results.forEach( (el,i) => {

            line = el.split(':');

            if (line.length < 3){
                thiscolor = colors[i % colors.length];
            } else {
                thiscolor = line[2].trim();
            }

            if (line.length > 3) timelineId = parseInt(line[3])
            else timelineId = 1;

            let duration;
            if (line.length < 2){
                duration = 5;
            } else {
                duration = parseFloat(line[1]);
                if (isNaN(duration)) duration = 5;
            }

            thisname = line[0].trim();

            let thisTask = [thisname, duration, thiscolor];
            console.log(timelineId);
            Tasks[timelineId].push(thisTask);
        });
        refreshTimeline();
        konsola.value = "";
    } else {
        console.log("No input data");
    }
}

function tasksToText(tasks, timelineId=0){
    outtext = "";
    tasks.forEach((el)=>{
        thisname = el[0].trim();
        duration_days = parseFloat(el[1]);
        thiscolor = el[2].trim();
        
        outtext += thisname + ":" + duration_days + ":" + thiscolor + ":"+ timelineId + "\n";
    });
    return outtext;
}


function drawAllTasks(tasks, parentObject, newTaskObj){
    // cleaning all childes from parent object
    while (parentObject.firstChild)
        parentObject.removeChild(parentObject.lastChild);
    // real time tracking
    let daysSofar = dayShift;

    // adding new childes
    tasks.forEach( (el,i) => {
        duration_days = el[1];
        duration = duration_days / 5; // as making from days to weeks

        // calculation for dates
        startDate = dayOfYear(daysSofar);

        // figure out how many weekends...
        // looping over the days and adding the Saturday and Sundays
        // if encounter 

        thisDayOfWeek = startDate.getDay();

        calendarDays = 0;
        d = 0;
        while ( d < duration_days - 1){
            d++;
            calendarDays++;
            thisDayOfWeek++;

            if(thisDayOfWeek == 6){
                // we are in weekend day
                calendarDays += 2;
                thisDayOfWeek = 1;
            } 
        }

        
        startDate = startDate.toLocaleDateString()
        daysSofar += calendarDays; 
        endDate = dayOfYear(daysSofar).toLocaleDateString();
        // adding one day - to not start next tas on the same date
        daysSofar++;
        // checking to not start on weekend
        if(  dayOfYear(daysSofar).getDay()== 6 ) daysSofar += 2;
        if(  dayOfYear(daysSofar).getDay()== 0 ) daysSofar += 1;

        thisname = el[0];
        thiscolor = el[2];

        newItem = newTaskObj.cloneNode(true);
        newItem.classList.remove('fresh');

        newItem.setAttribute('data-name',thisname);
        newItem.setAttribute('data-duration',duration_days);
        newItem.setAttribute('data-color',thiscolor);
        newItem.setAttribute('data-start', startDate);
        newItem.setAttribute('data-end', endDate);

        newItem.setAttribute('title', startDate +" : "+endDate );

        redrawTask(newItem, thisname, thiscolor, duration, i);

        parentObject.appendChild(newItem);
        
        // reselecting previous activeTask
        if (i==activeId && parentObject==activeTimeline){
            makeActive(newItem);
        }
    } );
    makeSetup(); // to bind event handlers
}

function refreshTimeline(){
    let w1 = document.querySelectorAll('.oneweek')[1];
    w1 = w1.clientWidth - 1;
    Tasks.forEach((tsk,i)=>{
        drawAllTasks(tsk, Timelines[i], tnew, w1);
    })
}

function clearTrash(){
    drawAllTasks([], trashcan, tnew, 0);
}

function clearAll(){
    Tasks.forEach((tsk,i)=>{
        drawAllTasks([], Timelines[i], tnew, 0);
    })
}

function readFrom(){
    Tasks.forEach((tsk,i)=>{
        Tasks[i] = readFromTimeline(Timelines[i]);
    })
}


function readFromTimeline(timelineObject){
    let allChildren = timelineObject.children;
    allChildren = Array.from(allChildren);

    let tempTasks = [];
    for( i=0; i < allChildren.length; i++ ){

        // memorizing the activeTask coordinates
        el = allChildren[i];
        if (el == activeTask){
            activeTimeline = timelineObject;
            activeId = i;
        }

        let thisName = el.getAttribute('data-name');
        let thisDuration = parseFloat(el.getAttribute('data-duration'));
        let thisColor = el.getAttribute('data-color');
        tempTasks.push([thisName, thisDuration, thisColor]);
    }
    return tempTasks;
}

function makeActive(target, markAgain = true){
    let isTask = target.classList.contains('draggable');
    if( isTask ) {

        if (target == activeTask && markAgain){
            activeTask.classList.remove('activeTask');
            activeTask = null;
            updateButton.innerHTML = 'Add Task';
            document.getElementById('updatePanel').innerHTML = 'Add Task:'
        } else {
            updateButton.innerHTML = 'Update Task';
            document.getElementById('updatePanel').innerHTML = 'Edit Task:'
            let thisName = target.getAttribute('data-name');
            let thisDuration = parseFloat(target.getAttribute('data-duration'));
            let thisColor = target.getAttribute('data-color');

            console.log(thisName, thisDuration, thisColor);
            if (activeTask) activeTask.classList.remove('activeTask')

            activeTask = target;
            activeTask.classList.add('activeTask')

            updateControl();
        }
    } else {
    }
}

function updateControl(){

        let thisName = activeTask.getAttribute('data-name');
        let thisDuration = parseFloat(activeTask.getAttribute('data-duration'));
        let thisColor = activeTask.getAttribute('data-color');

        aName.value = thisName;
        aDuration.value = thisDuration;
        aColor.value = thisColor;
}

function updateActive(dayChange=0){
    
    if (activeTask != null){

        thisname = aName.value.trim();
        i = activeTask.innerHTML.split(':')[0];

        duration_days = parseFloat(aDuration.value) + dayChange;
        if(duration_days < 1) duration_days = 1;
        duration = duration_days / 5; // as making from days to weeks
        thiscolor = aColor.value;

            activeTask.setAttribute('data-name',thisname);
            activeTask.setAttribute('data-duration',duration_days);
            activeTask.setAttribute('data-color',thiscolor);

            redrawTask(activeTask, thisname, thiscolor, duration, i);

        updateControl();
        readFrom();
        refreshTimeline();
        //makeActive(activeTask, false);
    } else {
        thisname = aName.value.trim();
        if (thisname == '') thisname = "New Task";
        i = "N";
        duration_days = parseFloat(aDuration.value);
        if(duration_days < 1 ||  isNaN(duration_days)) duration_days = 5;
        thiscolor = aColor.value;
        if (thiscolor.trim() == '') thiscolor = '#3333aa';

        let thisTask = [thisname, duration_days, thiscolor];
        Tasks[1].push(thisTask);
        console.log("pushing task as new...");
        console.log(thisTask);
        refreshTimeline();
    }
}

function redrawTask(task, thisname, thiscolor, duration, i=0){

        let addendum = 2*Math.floor(duration) -1;
        if (addendum <= 0) addendum = 0;
        // nasty hack for 3 days pixel align
        if (duration_days % 5 == 3) addendum += 1;

        let w1 = document.querySelectorAll('.oneweek')[1];
        w1 = w1.clientWidth - 1;
        let pad = 4;

        task.style.width = Math.floor(addendum + 1.0 * duration * w1 - 2*pad) + "px";
        task.style.backgroundColor = thiscolor;
        task.innerHTML = thisname;
}

function makeSetup(){
    draggables = document.querySelectorAll('.draggable')
    draggables.forEach(draggable => {
      draggable.addEventListener('dragstart', () => {
        draggable.classList.add('dragging')
      })

      draggable.addEventListener('dragend', () => {
        draggable.classList.remove('dragging')

          readFrom();

        refreshTimeline();
      })
    })
}

function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    return [d.getUTCFullYear(), weekNo];
}

function loadFromExternalFile(){
    let fileToLoad = loadfile.files[0];
    if (fileToLoad != ''){
        console.log(fileToLoad);
        var reader = new FileReader(); 
        reader.onload = function(e) {
                    konsola.value = reader.result;
                    grabDataFromConsole();
                }
        reader.readAsText(fileToLoad); 
                
    } else {
        console.log('No file selected');
    }
}

function loadDefaultData(){
        console.log(preloadeddata);
        konsola.value =  preloadeddata.contentWindow.body.innerHTML;
        //grabDataFromConsole();
}

function download(){

    grabDataToConsole();
    var text = konsola.value;
    text = text.trim();
    if (text.length > 0){
        text = text.replace(/\n/g, "\r\n"); // To retain the Line breaks.
        var blob = new Blob([text], { type: "text/plain"});
        var anchor = document.createElement("a");
        anchor.download = "timelines.gantt";
        anchor.href = window.URL.createObjectURL(blob);
        anchor.target ="_blank";
        anchor.style.display = "none"; // just to be safe!
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }
 }


function dayOfYear(dayOfYear) {
  year = (new Date()).getFullYear();
  return new Date(Date.UTC(year, 0, dayOfYear)) 
}
