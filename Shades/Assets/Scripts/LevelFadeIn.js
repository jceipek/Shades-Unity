// store a small, repeatable texture (a white square)
var theTexture : Texture2D;
private var StartTime : float;

function OnLevelWasLoaded(){
  // Store the current time
  StartTime = Time.time;
}

function Update(){
  // if 3 seconds have passed since the timer was started
  if(Time.time-StartTime >= 3){
    // destroy the gameobject this script is attached to
    Destroy(gameObject);
  }
}

function OnGUI(){
  // set the color of the GUI
  GUI.color = Color.white;

  // interpolate the alpha of the GUI from 1(fully visible) 
  // to 0(invisible) over time
  GUI.color.a = Mathf.Lerp(1.0, 0.0, (Time.time-StartTime));

  // draw the texture to fill the screen
  GUI.DrawTexture(Rect(0,0,Screen.width, Screen.height), theTexture);

}