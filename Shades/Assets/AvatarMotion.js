#pragma strict

var jumping;

var grounded;

var maxSpeed : float;

function Start () {
	jumping = false;
	grounded = false;
	maxSpeed = 10;
}

function Update () {
	if (Mathf.Abs(rigidbody.velocity.y) < maxSpeed){
		rigidbody.velocity.y = maxSpeed * Mathf.Sign(rigidbody.velocity.y);
	}

	if (! grounded){
		rigidbody.AddForce(0, -10, 0);
	}

	if (Input.GetButtonDown("Jump")) {
		jumping = true;
	}
	
	if (Input.GetButtonUp("Jump")) {
		jumping = false;
	}
	
	if(grounded && jumping) {
		rigidbody.AddForce(0, 1000, 0);
		grounded = false;
	}

	if (Input.GetKey(KeyCode.LeftArrow)) {
		transform.Translate(-9 * Time.deltaTime, 0, 0);
	}

	if (Input.GetKey(KeyCode.RightArrow)) {
		transform.Translate(9 * Time.deltaTime, 0, 0);
	}
}


function OnCollisionEnter(theCollision : Collision) {
	if(theCollision.gameObject.name == "PlatformObj"){
		grounded = true;
	}
}
