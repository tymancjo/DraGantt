const colors = ['#28559a','#3778c2','#4b9fe1','#63bce5','#7ed5eaj','#9cf6fb','#e1fcfd','#394f8a','#4a5fc1','#e5b9a8','#ead6cd'];

let draggables;
let containers;

const timelines_cnt = document.getElementById('timeline_cointainer');
const bufor         = document.getElementById('bufor');
const calendar      = document.querySelectorAll('.weeks')[0];
const zasobnik      = document.querySelectorAll('.sourcecontainer')[0];
const grabdata      = document.getElementById('grabdata');
const konsola       = document.getElementById('konsola');
const oneweek       = document.getElementById('fweek');
const tnew          = document.getElementById('tnew');
const aName         = document.getElementById('activeName');
const aDuration     = document.getElementById('activeDuration');
const aColor        = document.getElementById('activeColor');
const tod           = document.getElementById('tod');
const updateButton  = document.getElementById('activeUpdate');
const loadfile      = document.getElementById('fileinput');
const kcolaps       = document.getElementById('kcolaps');

let activeTask      = null;
let activeTimeline  = null;
let activeId        = null;


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

let konsolaState = false;
function toggleKonsola(){
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

// Dynamically creating timelines routine
// the idea:
// create the timeline objects using a proto object
// and keep those in the array. It probably good idea to
// use some  kind of structure for this...
class tml {
    constructor(Container){
        this.Container = Container;
        this.Data = [];
        this.Name = 'Timeline ';
}}

let Timelines_no   = 3;
let timeline_list  = [];
let new_cointainer = document.getElementById('timeline').cloneNode(true);
let new_coint_txt  = document.getElementById('timeline_txt_0').cloneNode(true);

while (timelines_cnt.firstChild)
    timelines_cnt.removeChild(timelines_cnt.lastChild);

for (i=0; i < Timelines_no; i++){
    let this_cointainer      = new_cointainer.cloneNode(true);
    let this_coint_txt       = new_coint_txt.cloneNode(true);
    let this_timeline        = new tml(this_cointainer);
    this_timeline.Name       = 'Timeline ' + i;
    this_coint_txt.innerText = this_timeline.Name;
    
    timeline_list.push(this_timeline);
    timelines_cnt.appendChild(this_cointainer);
    timelines_cnt.appendChild(this_coint_txt);
}
// And adding the bufor 
let this_timeline = new tml(bufor);
this_timeline.Name = 'Bufor';
timeline_list.push(this_timeline);

makeSetup();

draggables.forEach(element => {
    let w1 = document.querySelectorAll('.oneweek')[1].clientWidth - 2;
    let sizeTxt = w1 + 'px'
    element.style.width = sizeTxt;
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
    //Tasks.forEach((tsk,i)=>{
        //konsola.value += tasksToText(tsk, i);
    //})
    timeline_list.forEach((tsk, i)=>{
        konsola.value += tasksToText(tsk.Data, i);
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
            //Tasks[timelineId].push(thisTask);
            timeline_list[timelineId].Data.push(thisTask);
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


function drawAllTasks(tsk, newTaskObj){
    tasks = tsk.Data;
    parentObject = tsk.Container;
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
        if (i==activeId && parentObject==activeTimeline.Container){
            makeActive(newItem);
        }
    } );
    makeSetup(); // to bind event handlers
}

function refreshTimeline(){

    //clearing all timeline objects
    while (timelines_cnt.firstChild)
        timelines_cnt.removeChild(timelines_cnt.lastChild);

    let w1 = document.querySelectorAll('.oneweek')[1];
    w1 = w1.clientWidth - 1;

    timeline_list.forEach((tsk)=>{
        if (tsk.Name != "Bufor"){
            let this_cointainer      = new_cointainer.cloneNode(true);
            let this_coint_txt       = new_coint_txt.cloneNode(true);
            this_coint_txt.innerText = tsk.Name;

                timelines_cnt.appendChild(this_cointainer);
                timelines_cnt.appendChild(this_coint_txt);

            tsk.Container = this_cointainer;
        }
            drawAllTasks(tsk, tnew, w1);
    })

    makeSetup();
}

function clearTrash(){
    timeline_list[timeline_list.length -1].Data = [];
    drawAllTasks(timeline_list[timeline_list.length -1], tnew, 0);
}

function clearAll(){
    timeline_list.forEach((tsk)=>{
        tsk.Data = [];
        drawAllTasks(tsk, tnew, w1);
    })
}

function readFrom(){
    timeline_list.forEach((tsk)=>{
        tsk.Data = readFromTimeline(tsk);
    })
}


function readFromTimeline(timelineObject){
    let allChildren = timelineObject.Container.children;
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
        // Creating New Task
        thisname = aName.value.trim();
        if (thisname == '') thisname = "New Task";
        i = "N";
        duration_days = parseFloat(aDuration.value);
        if(duration_days < 1 ||  isNaN(duration_days)) duration_days = 5;
        thiscolor = aColor.value;
        if (thiscolor.trim() == '') thiscolor = '#3333aa';

        let thisTask = [thisname, duration_days, thiscolor];
        timeline_list[timeline_list.length -1].Data.push(thisTask);
        console.log("pushing task as new...");
        console.log(thisTask);
        activeId = null;
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
    containers = document.querySelectorAll('.container');

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
            });

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
