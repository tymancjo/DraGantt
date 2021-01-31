const colors = ['#28559a','#3778c2','#4b9fe1','#63bce5','#7ed5eaj'];
// '#9cf6fb','#e1fcfd','#394f8a','#4a5fc1','#e5b9a8','#ead6cd'

let allTasks0 = [];
let allTasks = [];


let draggables = document.querySelectorAll('.draggable')
const containers = document.querySelectorAll('.container')
const calendar = document.querySelectorAll('.weeks')[0];
const zasobnik = document.querySelectorAll('.sourcecontainer')[0];
const grabdata = document.getElementById('grabdata');
const konsola = document.getElementById('konsola');

const oneweek = document.getElementById('fweek');
const timeline0 = document.getElementById('timeline0');
const timeline = document.getElementById('timeline');
const tnew = document.getElementById('tnew');
const enew = document.getElementById('enew');

// binding action to resize event
window.addEventListener('resize', refreshTimeline);

// binding the action to the button
grabdata.addEventListener('click', grabDataFromConsole);
refresh.addEventListener('click', refreshTimeline);
readback.addEventListener('click', readFrom);
cleartrash.addEventListener('click', clearTrash);

// creating the calendar for weeks 
calendar.removeChild(oneweek);
for (let i=1; i < 53; i++){
    let newweek = oneweek.cloneNode(true);
    newweek.innerText = i;
    calendar.appendChild(newweek);
}

// reading some data from default file from server
//loadFileAndPrintToConsole('https://threejsfundamentals.org/LICENSE');
//readTextFile('./def.data');
// adding some random size just for fun and to have something to start with
//
draggables.forEach(element => {
    let w1 = document.querySelectorAll('.oneweek')[1].clientWidth;
    let sizeTxt = w1 + 'px'
    element.style.width = sizeTxt;
})

function makeSetup(){
    draggables = document.querySelectorAll('.draggable')
    draggables.forEach(draggable => {
      draggable.addEventListener('dragstart', () => {
        draggable.classList.add('dragging')
      })

      draggable.addEventListener('dragend', () => {
        draggable.classList.remove('dragging')

        let isfresh = draggable.classList.contains('fresh');
        allTasks = readFromTimeline(timeline);
        allTasks0 = readFromTimeline(timeline0);

        if (isfresh){
            let nowyelement = draggable.cloneNode(true);
            nowyelement.classList.remove('dragging')
            zasobnik.appendChild(nowyelement);
            draggable.classList.remove('fresh');
            makeSetup(); 
        }
        refreshTimeline();
      })
    })
}


makeSetup(); 

containers.forEach(container => {
  container.addEventListener('dragover', e => {
    e.preventDefault()
    const afterElement = getDragAfterElement(container, e.clientX)
    const draggable = document.querySelector('.dragging')

    if (afterElement == null) {
        container.appendChild(draggable)
        //if (isfresh){
            //let nowyelement = draggable.cloneNode(true);
            //nowyelement.classList.remove('dragging')
            //zasobnik.appendChild(nowyelement);
            //draggable.classList.remove('fresh');
            //allTasks.push(['New', 1]);
            //makeSetup(); 
        //}
    } else {
      container.insertBefore(draggable, afterElement)
        //if (isfresh){
            //let nowyelement = draggable.cloneNode(true);
            //nowyelement.classList.remove('dragging')
            //zasobnik.appendChild(nowyelement);
            //draggable.classList.remove('fresh');
            //makeSetup(); 
        //}
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

function grabDataFromConsole(){

    let allText = konsola.value.trim();
    if (allText != ""){
        results = allText.split(/\r?\n/);

        results.forEach( (el,i) => {
            thiscolor = colors[i % colors.length];
            
            line = el.split(':');

            let duration;
            if (line.length < 2){
                duration = 1;
            } else {
                duration = parseFloat(line[1]);
                if (duration == "NaN") duration = 1;
            }

            thisname = line[0].trim();
            
            let thisTask = [thisname, duration, thiscolor];
            allTasks.push(thisTask);
            
            // adding the tasks to timeline
        } );
        refreshTimeline();
    } else {
        console.log("No input data");
    }
}

function drawAllTasks(tasks, parentObject, newTaskObj, weekPx, pad=4){
    // cleaning all childes from parent object
    while (parentObject.firstChild) 
        parentObject.removeChild(parentObject.lastChild);
    
    // adding new childes
    tasks.forEach( (el,i) => {
        duration = el[1];
        thisname = el[0];
        thiscolor = el[2];
        
        newItem = newTaskObj.cloneNode(true);
        newItem.classList.remove('fresh');
        newItem.style.width = (duration - 1) + 1.0 * duration * weekPx - 2*pad + "px";
        newItem.style.backgroundColor = thiscolor;
        newItem.innerHTML = i + ": "+thisname;

        newItem.setAttribute('data-name',thisname);
        newItem.setAttribute('data-duration',duration);
        newItem.setAttribute('data-color',thiscolor);

        parentObject.appendChild(newItem);
    } );

    makeSetup(); // to bind event handlers
}

function refreshTimeline(){
    let w1 = document.querySelectorAll('.oneweek')[1];
    drawAllTasks(allTasks, timeline, tnew, w1.clientWidth);
    drawAllTasks(allTasks0, timeline0, tnew, w1.clientWidth);
}

function clearTrash(){
    drawAllTasks([], trashcan, tnew, 0);
}

function readFrom(){
    allTasks = readFromTimeline(timeline);
    allTasks0 = readFromTimeline(timeline0);
}

function readFromTimeline(timelineObject){
    let allChildren = timelineObject.children;
    allChildren = Array.from(allChildren);

    let tempTasks = [];

    for( i=0; i < allChildren.length; i++ ){
        el = allChildren[i];
        let thisName = el.getAttribute('data-name');
        let thisDuration = parseFloat(el.getAttribute('data-duration'));
        let thisColor = el.getAttribute('data-color');
        tempTasks.push([thisName, thisDuration, thisColor]);
    }
    
    timelineArray = [];
    tempTasks.forEach(el => {timelineArray.push(el)});

    return timelineArray;
}
