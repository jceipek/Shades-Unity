#pragma strict

var selectedTexture : Texture;
var deselectedTexture : Texture;
var fadeTexture : Texture;
var fadeDuration : float;

private var triggered : boolean = false;
private var StartTime : float;

function OnMouseDown() {
    SendMessage("Clicked");
}

function OnMouseEnter() {
    renderer.material.mainTexture = selectedTexture;
}

function OnMouseExit() {
    renderer.material.mainTexture = deselectedTexture;
}

function Clicked() {
	renderer.material.mainTexture = selectedTexture;
	triggered = true;
	StartTime = Time.time;
}

function OnGUI(){
  if(triggered) {
	  // set the color of the GUI
	  GUI.color = Color.white;
	
	  // interpolate the alpha of the GUI from 1(fully visible) 
	  // to 0(invisible) over time
	  GUI.color.a = Mathf.Lerp(0.0, 1.0, (Time.time-StartTime)/fadeDuration);
	
	  // draw the texture to fill the screen
	  GUI.DrawTexture(Rect(0,0,Screen.width, Screen.height), fadeTexture);
  }

}

// Require a box collider for the trigger
@script RequireComponent(BoxCollider)