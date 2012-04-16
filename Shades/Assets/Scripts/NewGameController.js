#pragma strict

var firstLevel : String;

function Clicked() {
	PlayerPrefs.DeleteAll();
	PlayerPrefs.Save();
	Application.LoadLevel(firstLevel);
}