#pragma strict

var level:String;
var fadeTexture : Texture2D;

private var StartTime : float;
private var triggered = false;

function OnTriggerEnter(other : Collider) {
	if (other.tag == "Player") {
		other.gameObject.SendMessage ("SetControllable", false);
		triggered = true;
		StartTime = Time.time;
		GameObject.FindWithTag("MainCamera").SendMessage("SwitchLevel");
	}
}

function Update(){
  if(triggered && Time.time-StartTime >= 1){
    Application.LoadLevel(level);
  }
}

function OnGUI(){
  if(triggered) {
	  // set the color of the GUI
	  GUI.color = Color.white;
	
	  // interpolate the alpha of the GUI from 1(fully visible) 
	  // to 0(invisible) over time
	  GUI.color.a = Mathf.Lerp(0.0, 1.0, (Time.time-StartTime));
	
	  // draw the texture to fill the screen
	  GUI.DrawTexture(Rect(0,0,Screen.width, Screen.height), fadeTexture);
  }

}

// Require a box collider for the trigger
@script RequireComponent(BoxCollider)