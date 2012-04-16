#pragma strict

function Awake() {
	if (!PlayerPrefs.HasKey("Level")) {
		gameObject.active = false;
	}
}

function Clicked() {
	var levelToLoad = PlayerPrefs.GetString("Level");
	Application.LoadLevel(levelToLoad);
}