#pragma strict

var splitX : int = 1;
var splitY : int = 1;
var initialOffsetX : float = 0;
var initialOffsetY : float = 0;

var cycleRate : float = 1.0f;

var currIndex : int = 0;

var randomDelay : boolean = false;
var delayLength : float = 0.0f;

private var timer : float;

function Start() {
	if (randomDelay) {
		timer -= Random.value * delayLength;
	} else {
		timer -= delayLength;
	}
}

function Update() {
	if (timer >= cycleRate) {

		timer = 0.0f;
		currIndex += 1;
		
		if (currIndex > splitX*splitY) {
			currIndex = 0;
			if (randomDelay) {
				timer -= Random.value * delayLength;
			} else {
				timer -= delayLength;
			}
		}
		
		var offset : Vector2 = new Vector2(parseFloat(currIndex%splitX)/parseFloat(splitX)+initialOffsetX, Mathf.Floor(currIndex/splitX)/parseFloat(splitY)+initialOffsetY);
		renderer.material.SetTextureOffset ("_MainTex", offset);
	} else {
		timer += Time.deltaTime;
	}
	

}