'use strict';

let intial=0
const form = document.querySelector('.workout__form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.getElementById('type');
const inputDistance = document.querySelector('.input__distance');
const inputDuration = document.querySelector('.input__duration');
const inputCadence = document.querySelector('.input__cadence');
const inputElevation = document.querySelector('.input__elevation');
const workoutList=document.querySelector(".workout__list");

class Workout{
    date=new Date();
   
    constructor(coords,distance,duration){
        this.distance=distance;
        this.duration=duration;
        this.coords=coords;
        this.id=Math.random();
    }

    _setDescription(){
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description=`${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
    }
}
class Running extends Workout{
    type='running'
    constructor(coords,distance,duration,cadence){
        super(coords,distance,duration);
        this.cadence=cadence
        this.calcPace();
        this._setDescription()
    }
    calcPace(){
        this.pace=this.duration / this.distance;
        return this.pace
    }
}
class Cycling extends Workout{
    type='cycling'
        constructor(coords,distance,duration,elevation){
        super(coords,distance,duration);
        this.elevation=elevation;
        console.log(this.elevation)
        this.calcSpeed();
        this._setDescription();
    }
    calcSpeed(){
        this.speed=this.distance / this.duration;
        return this.speed
    }

}


class App{
    #workouts=[];
    #map;
    #mouseEventGlobal;
    constructor(){
        this.clearLocalStorage()
        //get position map
      if(navigator.geolocation){
       this._getPosition();
       
                               }
       this._getLocalStorage();                   


  //on submit form
        form.addEventListener('submit',this._newWorkout.bind(this))

   //clear
     document.querySelector('.clear-btn').addEventListener('click',this.clearLocalStorage)
  //toggle Elevation and cadence
        inputType.addEventListener('change',this._toggleElevationField)

   //on click workout move map to it
        workoutList.addEventListener('click',this.moveOnClick.bind(this))     

    }
    _getPosition(){
                navigator.geolocation.getCurrentPosition((position)=>{
        this._loadMap(position).bind(this);    
    },()=>{
        alert(`ops we can't determine your location`)
    })
          


    }
    _loadMap(position){
        //get and load map 
         //get coords position       
        const {latitude,longitude}=position.coords;
        const coords=[latitude,longitude]

        
        this.#map = L.map('map').setView(coords, 12);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(this.#map);


   this.#map.on('click',(mouseEvent)=>{
        this._showForm();
        this.#mouseEventGlobal=mouseEvent;

        this.#workouts.forEach(workout=>{
            this._renderWorkOutListMap(workout);
            this._renderWorkOutOnMap(workout);
        })
        
  

        })

    }
    _showForm(){
        form.style.display='flex';
        form.classList.remove("hidden");
        inputDistance.focus();
    }
    _hideForm(){

        //clear inputs
        inputCadence.value=inputDistance.value=inputDuration.value=inputElevation.value=''
        form.style.display='none';
        //hide form
        form.classList.add('hidden')

    }


    _toggleElevationField(){
     inputCadence.closest('.form__row').classList.toggle('hidden__row');
     inputElevation.closest('.form__row').classList.toggle('hidden__row');

    }
    _newWorkout(e){
                e.preventDefault()

        const checkValid=(...inputs)=>{return inputs.every(inp => Number.isFinite(inp))}
        const checkPositive=(...inputs)=>{return inputs.every(inputvalue=>inputvalue>0)}
        //get variables
         const {lat,lng}=this.#mouseEventGlobal.latlng;
        const inputTypeValue=inputType.value;
        const inputDistanceValue=+inputDistance.value;
        const inputDurationValue=+inputDuration.value;
        let workout

        //add running workout if type workout
        if(inputTypeValue==='running'){

            //get the value cadence

            const inputCadenceValue=+inputCadence.value;

            //check validaty of inputs
            if(!checkValid(inputCadenceValue,inputDistanceValue,inputDurationValue) || !checkPositive(inputCadenceValue,inputDistanceValue,inputDurationValue)){
                return alert('all inputs should be positive and numbers');
            }
            //create workout
            workout=new Running([lat,lng],inputDistanceValue,inputDurationValue,inputCadenceValue);
        }


        //add cycling workout if type cylcing
        if(inputTypeValue==='cycling'){

            //get the value cadence

            const inputElevationValue=+inputElevation.value;
            console.log(inputElevationValue)
            //check validaty of inputs
            if(!checkValid(inputElevationValue,inputDistanceValue,inputDurationValue) || !checkPositive(inputElevationValue,inputDistanceValue,inputDurationValue)){
                return alert('all inputs should be positive and numbers');
            } 
            //create workout
            
            workout=new Cycling([lat,lng],inputDistanceValue,inputDurationValue,inputElevationValue);   

        }
        //add workout to workouts list
        this.#workouts.push(workout);

       //render workout on map
        this._renderWorkOutOnMap(workout);
        
       //render workout on sidebar on list
       this._renderWorkOutListMap(workout) 

       //hide form
       this._hideForm();

       //set local storage
       this._setLocalStorage();
        
    }


    _renderWorkOutListMap(workout){
        let html=`<li class='workout__item  ${workout.type}__workout' data-id=${workout.id}>
      <h2 class="workout__item--header">${workout.description}</h2>
        <div class="workout__details">🚴‍♀️ ${workout.distance}<span>KM</span></div>
        <div class="workout__details">⏱ ${workout.duration}<span>MIN</span></div>
`


        if(workout.type==='running'){
            html+=`
        <div class="workout__details">⚡️ ${workout.pace.toFixed(1)}<span>MIN/KM</span></div>
        <div class="workout__details">🦶🏼 ${workout.cadence} <span>spm</span></div>
        </li>
    `
            
        }
        if(workout.type==='cycling'){
            html+=`
                    <div class="workout__details">⚡️ ${workout.speed.toFixed(1)}<span>KM/MIN</span></div>
        <div class="workout__details">⛰ ${workout.elevation} <span>spm</span></div>
        </li>`
        }
        document.querySelector(".workout__list").insertAdjacentHTML('beforeend',html)
    }





    _renderWorkOutOnMap(workout){
                L.marker(workout.coords).addTo(this.#map)
    .bindPopup(L.popup({
        maxWidth:250,
        minWidth:150,
        closeButton:true,
        autoClose:false,
        closeOnClick:false,
        className:`${workout.type}-popup`
    }).setContent('<p>Hello world!<br />This is a nice popup.</p>'))
    .openPopup();  
    }
    
    moveOnClick(e){
        const workoutHtml=e.target.closest('.workout__item');
        console.log(workoutHtml)
        if(!workoutHtml) return;
        const workout=this.#workouts.find(work=>{
         return   workoutHtml.dataset.id==work.id})

         
        this.#map.setView(workout.coords,13,{
            animate:true,
            pin:{
               duration:1, 
            }
        })

    }
    _setLocalStorage(){
        localStorage.setItem('workouts',JSON.stringify(this.#workouts))
    }

    async _getLocalStorage(){
        let workoutsSaved= await JSON.parse(localStorage.getItem('workouts'))

        if(!workoutsSaved) return;
        this.#workouts=workoutsSaved;

    }
    async clearLocalStorage(){
        console.log(intial)
        if(intial==1){
      
                    localStorage.clear()

                    document.querySelector(".workout__list").innerHTML=''
   

       }
        else{
            intial++
        }
        
    }
}



const app=new App();
