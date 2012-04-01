#pragma strict

//////////////////////////////
// Variable Defs START
//////////////////////////////

// Does this script currently respond to Input?
var canControl = true;

// Spawn avatar here if it dies.
var spawnPoint : Transform;

// Movement Related Variables
class AvatarControllerMovement {
	// The speed when walking 
	var walkSpeed = 5.0;
	// Could add more types of speed here if we want (ex: runSpeed, rollerBladeSpeed, etc...)

	var inAirControlAcceleration = 1.0; // Decrease to make the character harder to shift in the air

	// The gravity for the character
	var gravity = 1.2;
	var jumpForce = 9.0;
	var terminalVelocity = 20.0;

	// How fast does the character change speeds?  Higher is faster.
	var speedSmoothing = 5.0;

	// The current vertical speed
	@System.NonSerialized
	var verticalSpeed = 0.0;
	
	@System.NonSerialized
	var horizontalSpeed = 0.0;

	// The current movement speed.  This gets smoothed by speedSmoothing.
	@System.NonSerialized
	var speed = 0.0;

	// The last collision flags returned from controller.Move
	@System.NonSerialized
	var collisionFlags : CollisionFlags; 

	// We will keep track of an approximation of the character's current velocity, so that we return it from GetVelocity() for our camera to use for prediction.
	@System.NonSerialized
	var velocity : Vector3;

}

var movement : AvatarControllerMovement;

// Jumping Related Variables
class AvatarControllerJumping {
	// Can the character jump?
	var enabled = true;

	// How high do we jump when pressing jump and letting go immediately
	var minHeight = 1.0;
	// We add extraHeight units (meters) on top when holding the button down longer while jumping
	var maxHeight = 4.1;
	
	// This time the avatar needs to recover from a jump before it can jump again, in seconds
	// The next line, @System.NonSerialized , tells Unity to not serialize the variable or show it in the inspector view.  Very handy for organization!
	//@System.NonSerialized
	var recoverTime = 0.05;

	// The time you have to wait before pressing the jump button again, in seconds
	//@System.NonSerialized
	var timeout = 0.15;

	// Are we jumping?
	// 0 = No
	// 1 = 1 jump
	// 2 = double jump
	@System.NonSerialized
	var jumpingLevel = 0;
	var maxJumpingLevel = 1;
  
	// Last time the jump button was clicked down
	@System.NonSerialized
	var lastButtonTime = -10.0;
	
	// Last time we performed a jump
	//@System.NonSerialized
	//var lastTime = -repeatTime; // Set to negative so the avatar can jump right from the beginning
	//XXX: May need to move this to Start(), depending on Unity's behavior

	// the height we jumped from (Used to determine for how long to apply extra jump power after jumping.)
	@System.NonSerialized
	var lastStartHeight = 0.0;
}

var jump : AvatarControllerJumping;

private var controller : CharacterController; // We need this to use our own physics while still getting collisions. It will stop us from pushing objects without a separate script, though.

//////////////////////////////
// Variable Defs END
//////////////////////////////

// Don't call manually!
function Awake () {
	// Called before any Start functions and lets us initialize stuff. Always called (but only once) even if object is disabled, so use this for construction.	
	controller = GetComponent(CharacterController);
		
	// Always ignore physics of world avatar is not in. XXX: Not sure if this is the right place to put this code...
	Physics.IgnoreLayerCollision(LayerMask.NameToLayer("DarkWorld"),LayerMask.NameToLayer("LightWorld"),true);
	Physics.IgnoreLayerCollision(LayerMask.NameToLayer("LightWorld"),LayerMask.NameToLayer("DarkWorld"),true);
	
	//Spawn (); // TODO: Enable this and set a spawn point
}

function ChangeWorld() {
	if(gameObject.layer == LayerMask.NameToLayer("DarkWorld")){
		gameObject.layer = LayerMask.NameToLayer("LightWorld");
	}else{
		gameObject.layer = LayerMask.NameToLayer("DarkWorld");
	}
}

// Call this whenever you want the character to respawn at the spawn point
function Spawn () {
	// reset the character's speed
	movement.verticalSpeed = 0.0;
	movement.horizontalSpeed = 0.0;
	movement.speed = 0.0;
	
	// reset the character's position to the spawnPoint
	transform.position = spawnPoint.position;
	
}

// Call when died
function OnDeath () {
	// Respawn character at last spawn point
	Spawn();
}

function ChangeWorld() {
	if(gameObject.layer == LayerMask.NameToLayer("DarkWorld")){
		gameObject.layer = LayerMask.NameToLayer("LightWorld");
	}else{
		gameObject.layer = LayerMask.NameToLayer("DarkWorld");
	}
}

function UpdateSmoothedMovementDirection () {	
	var h = Input.GetAxisRaw("Horizontal"); // This is nice because it means that an analog input device will have more control

}

// Call when jump button is pressed
function ApplyJumping () {
	
}

function ApplyGravity () {
	if (controller.isGrounded && movement.verticalSpeed <= 0.0) {
		// Apply constant gravity when touching the ground, as long as we are not
		// trying to jump up.
		jump.lastStartHeight = transform.position.y;
		movement.verticalSpeed = -movement.gravity;
		
	} else {
		// Pull down the avatar with gravity.
		movement.verticalSpeed -= movement.gravity;
	}

}

function CalculateJumpVerticalSpeed(targetJumpHeight : float) {
	// From the jump height and gravity we deduce the upwards speed 
	// needed for the character to reach the apex.
	return Mathf.Sqrt(2 * targetJumpHeight * movement.gravity);
}

function Update() {

	if (canControl) {
		var h = Input.GetAxisRaw("Horizontal");
	
		if (Input.GetButtonDown("Jump")) {
			// Button Pressed after not being pressed
			jump.jumpingLevel++;
			jump.lastButtonTime = Time.time;
			Debug.Log("Jump");
			if(controller.isGrounded) {
				Debug.Log("Grounded");
				// Initiate jump from ground
				jump.lastStartHeight = transform.position.y;
				jump.jumpingLevel = 0;
				movement.verticalSpeed = movement.jumpForce;
				//movement.verticalSpeed = CalculateJumpVerticalSpeed(jump.minHeight);
			}
		}
		
		if (controller.isGrounded) {
			var curSmooth = movement.speedSmoothing * Time.deltaTime;
			movement.horizontalSpeed = Mathf.Lerp(movement.horizontalSpeed, h*movement.walkSpeed, curSmooth);
		} else {
			curSmooth = movement.speedSmoothing * Time.deltaTime;
			movement.horizontalSpeed = Mathf.Lerp(movement.horizontalSpeed, h*movement.walkSpeed*movement.inAirControlAcceleration, curSmooth);
		}
		
		if (movement.verticalSpeed > 0.0) {
			if (jump.jumpingLevel > 0 && (transform.position.y - jump.lastStartHeight < jump.minHeight)) {
				movement.verticalSpeed = movement.jumpForce;
			} else {
				if (Input.GetButton("Jump") && 
				(transform.position.y - jump.lastStartHeight < jump.maxHeight)) {
					movement.verticalSpeed = movement.jumpForce;
				}
			}
		}
		
	}
	
		
	ApplyGravity();
	
	
	
	// Save lastPosition for velocity calculation.
	var lastPosition = transform.position;
	
	// Calculate actual motion
	var currentMovementOffset = Vector3(movement.horizontalSpeed, movement.verticalSpeed, 0);
	
	// We always want the movement to be framerate independent.  Multiplying by Time.deltaTime does this.
	currentMovementOffset *= Time.deltaTime;
	
   	// Move our character!
	movement.collisionFlags = controller.Move(currentMovementOffset);
	
	// Calculate the velocity based on the current and previous position.  
	// This means our velocity will only be the amount the character actually moved as a result of collisions.
	movement.velocity = (transform.position - lastPosition) / Time.deltaTime;

}


//////////////////////////////
// Helper Functions START
//////////////////////////////
function GetSpeed () {
	return movement.speed;
}

function GetVelocity () {
	return movement.velocity;
}


//function IsMoving () {
	//return movement.isBeingSteered;
//}

function IsJumping () {
	return jump.jumpingLevel > 0;
}

function IsTouchingCeiling () {
	return (movement.collisionFlags & CollisionFlags.CollidedAbove) != 0;
}

//function GetDirection () {
//	return movement.direction;
//}

//function GetHangTime() {
//	return movement.hangTime;
//}

function Reset () {
	gameObject.tag = "Player";
}

function SetControllable (controllable : boolean) {
	canControl = controllable;
}

//////////////////////////////
// Helper Functions END
//////////////////////////////

// Require a character controller to be attached to the same game object
@script RequireComponent (CharacterController)

// Put the script in the menu
@script AddComponentMenu ("2D Platformer/Avatar Controller")
