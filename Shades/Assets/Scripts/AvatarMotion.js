#pragma strict

var jumpForce : float;
var maxSpeed : float;

var movementSpeed : float;
var airModifier : float;

var groundDetectionRange : float; //How far from ground you can be to jump

function Start () {
	Physics.IgnoreLayerCollision(LayerMask.NameToLayer("DarkWorld"),LayerMask.NameToLayer("LightWorld"),true);
	Physics.IgnoreLayerCollision(LayerMask.NameToLayer("LightWorld"),LayerMask.NameToLayer("DarkWorld"),true);
}

function Update () {
	var grounded;
	var horizMovement : Vector2;
	
	horizMovement = Input.GetAxis("Horizontal") * transform.right * Time.deltaTime * movementSpeed;
	
	//Check if the character is grounded; we can later use layers to make sure we are in the right world when we make the check
	var rayHit : RaycastHit;
	if (Physics.Raycast(transform.position, -transform.up, rayHit, groundDetectionRange)) {
    	grounded = true;
    } else {
		horizMovement *= airModifier;
		grounded = false;
	}

	//jump if the user pressing the jump AND our character is grounded
	if (Input.GetButtonDown("Jump") && grounded)
	{
		rigidbody.AddRelativeForce(transform.up * jumpForce, ForceMode.Impulse);
		//rigidbody.velocity.y = jumpForce;
	}
	
	//Limit terminal velocity
	if (rigidbody.velocity.magnitude > maxSpeed) {
		rigidbody.velocity = rigidbody.velocity.normalized * maxSpeed;
	} 
 
 	//move the avatar (walking/in the air)
	transform.Translate(horizMovement);

}


function OnCollisionEnter(theCollision : Collision) {
	//if(theCollision.gameObject.name == "PlatformObj"){
	//	grounded = true;
	//}
}
