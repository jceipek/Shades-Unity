#pragma strict

import System.Collections.Generic;


//////////////////////////////
// Variable Defs START
//////////////////////////////

// Does this script currently respond to Input?
var canControl = true;

// Spawn avatar here if it dies.
var spawnPoint : GameObject;
var darkTexture : Texture;
var lightTexture : Texture;

var mobileDeadZoneWidth : float  = 2.0f;
var mobileJumpSensitivity : float  = 150.0f;

var touchHistory : Dictionary.<int, List.<Touch> > = new Dictionary.<int, List.<Touch> >();

// Movement Related Variables
class AvatarControllerMovement {
	// The speed when walking 
	var walkSpeed = 5.0;
	@System.NonSerialized
	var isWalking = false;
	// Could add more types of speed here if we want (ex: runSpeed, rollerBladeSpeed, etc...)

	var inAirControlAcceleration = 1.0; // Decrease to make the character harder to shift in the air

	// The gravity for the character
	var gravity = 1.2;
	
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
	
	@System.NonSerialized
	var facing : int = 0;
	
	@System.NonSerialized
	var falling : boolean = false;

}

var movement : AvatarControllerMovement;

// Jumping Related Variables
class AvatarControllerJumping {
	// Can the character jump?
	var enabled = true;

	var firstJumpForce = 9.0; // Power to oppose gravity during first part of jump
	var secondJumpForce = 9.0; // Power to oppose gravity on any subsequent part of the jump
	var stickiness = 0.85; // Avatar can actually go above max height unless this is 0

	// Up to what distance is force continuously applied if we tap the jump button
	var minHeight = 1.0;
	// Up to what distance is force continuously applied when we hold the button down longer while jumping
	var maxHeight = 4.1;
	
	// This time the avatar needs to recover from a jump before it can jump again, in seconds
	// The next line, @System.NonSerialized , tells Unity to not serialize the variable or show it in the inspector view.  Very handy for organization!
	//@System.NonSerialized
	var recoverTime = 0.05;

	// The time you have to wait before pressing the jump button again, in seconds
	//@System.NonSerialized
	var timeout = 0.15;
	
	var ceilingRestitution = 0.1; // What fraction of the upwards velocity is preserved when hitting the ceiling

	// Are we jumping?
	// 0 = No
	// 1 = 1 jump
	// 2 = double jump
	
	@System.NonSerialized
	var jumpingLevel = 0;
	var maxJumpingLevel = 1; // How many jumps can we chain (double-jumping, triple-jumping, etc...). 1 is no extra jumps
  
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
	
	var maxMobileTimer : float = 10000.0f;
	@System.NonSerialized
	var mobileTimer : float = 0.0f; // Used for high jumps on Mobile
}

var jump : AvatarControllerJumping;

class AvatarControllerClimbing {

	var climbForce = 20.0;

}

var climb : AvatarControllerClimbing;

private var controller : CharacterController; // We need this to use our own physics while still getting collisions. It will stop us from pushing objects without a separate script, though.

//////////////////////////////
// Variable Defs END
//////////////////////////////

// Don't call manually!
function Awake() {
	// Called before any Start functions and lets us initialize stuff. Always called (but only once) even if object is disabled, so use this for construction.	
	controller = GetComponent(CharacterController);
		
	// Always ignore physics of world avatar is not in. XXX: Not sure if this is the right place to put this code...
	Physics.IgnoreLayerCollision(LayerMask.NameToLayer("DarkWorld"),LayerMask.NameToLayer("LightWorld"),true);
	Physics.IgnoreLayerCollision(LayerMask.NameToLayer("LightWorld"),LayerMask.NameToLayer("DarkWorld"),true);
	
	CorrectTexture();
}

function Start() {
	Spawn();
}

// Call this whenever you want the character to respawn at the spawn point
function Spawn () {
	// reset the character's speed
	movement.verticalSpeed = 0.0;
	movement.horizontalSpeed = 0.0;
	movement.speed = 0.0;
	
	// reset the character's position to the spawnPoint
	transform.position = spawnPoint.transform.position;
	
	// Put the character on the correct layer
	gameObject.layer = spawnPoint.layer;
	
	CorrectTexture();
	
}

// Call when died
function OnDeath () {
	// Respawn character at last spawn point
	Spawn();
}

function ChangeWorldTo(layer : int) {
	gameObject.layer = layer;
	CorrectTexture();
}

function SetSpawnPointTo(newSpawnPoint : GameObject) {
	spawnPoint = newSpawnPoint;
}

function UpdateSmoothedMovementDirection () {	
	var h = Input.GetAxisRaw("Horizontal"); // This is nice because it means that an analog input device will have more control

}

// Call when jump button is pressed
function ApplyJumping () {
	
}

function OnControllerColliderHit (hit : ControllerColliderHit) {
		if (movement.falling && hit.moveDirection.y < 0.0) {
			movement.falling = false;
			hit.collider.gameObject.SendMessage("ImpactAt", hit.point, SendMessageOptions.DontRequireReceiver);
		}

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
		if (!movement.falling) {
			movement.falling = true;
			SendMessage("FallingInitiated");
		}
	}

	// Don't fall too fast! Can be used for a "floaty" effect.
	if (movement.verticalSpeed < -movement.terminalVelocity) {
		movement.verticalSpeed = -movement.terminalVelocity;
	}

}

function Update() {

	if (canControl) {
		var h = Input.GetAxisRaw("Horizontal");
		var jumpPressed : boolean = Input.GetButtonDown("Jump"); // Button Pressed after not being pressed
		
		for (var touch : Touch in Input.touches) {
			var ray : Ray = Camera.main.ScreenPointToRay(touch.position);


			var offsetFromAvatar : float = ray.origin.x - transform.position.x;
			if (offsetFromAvatar < -mobileDeadZoneWidth) {
				h = -1.0f;
			} else if (offsetFromAvatar > mobileDeadZoneWidth) {
				h = 1.0f;
			} else {
				h = 0.0f;
			}
			
			if (!touchHistory.ContainsKey(touch.fingerId)) {
				var newList : List.<Touch> = new List.<Touch>();
				touchHistory.Add(touch.fingerId, newList);
			}
			touchHistory[touch.fingerId].Add(touch);
			if (touchHistory[touch.fingerId].Count > 5) {
				touchHistory[touch.fingerId].RemoveAt(0);
			}
				
			if (touch.phase == TouchPhase.Ended) {
				var delta = touch.position - touchHistory[touch.fingerId][0].position;
				
				Debug.Log("Delta:");
				Debug.Log(delta.magnitude.ToString("F10"));
				
				if (delta.magnitude > mobileJumpSensitivity) {
					jumpPressed = true;
					jump.maxMobileTimer = Mathf.Lerp(0.0f, jump.maxMobileTimer, delta.magnitude/mobileJumpSensitivity);
				}
				
				touchHistory.Remove(touch.fingerId);
			}
			
			if (touch.phase == TouchPhase.Canceled) {
				touchHistory.Remove(touch.fingerId);
			}
			
        	//var hit : RaycastHit;
        	//if (Physics.Raycast (ray, hit, 100.0f)) {
            //	hit.transform.SendMessage("Clicked");
       		//}
		}
		
		
		if (h > 0.0) {
			if (movement.facing != 1) {
				transform.rotation.y = 180;
			}
			movement.facing = 1;
		} else if (h < 0.0) {
			movement.facing = -1;
			if (movement.facing != 1) {
				transform.rotation.y = 0;
			}
		}
	
		if (jumpPressed) {

			jump.lastButtonTime = Time.time;
			if(controller.isGrounded) {
				// Initiate jump from ground
				jump.lastStartHeight = transform.position.y;
				jump.jumpingLevel = 0;
				movement.verticalSpeed = jump.firstJumpForce;
				SendMessage("JumpInitiated");
			}
			
			jump.jumpingLevel++;
		}
		
		// Grounded and in-air side-by-side movement
		if (controller.isGrounded) {
			
			var curSmooth = movement.speedSmoothing * Time.deltaTime;
			movement.horizontalSpeed = Mathf.Lerp(movement.horizontalSpeed, h*movement.walkSpeed, curSmooth);
			if (Mathf.Abs(movement.horizontalSpeed) > 0.5) {
				movement.isWalking = true;
			} else {
				movement.isWalking = false;
			}
		} else {
			movement.isWalking = false;
			curSmooth = movement.speedSmoothing * Time.deltaTime;
			movement.horizontalSpeed = Mathf.Lerp(movement.horizontalSpeed, h*movement.walkSpeed*movement.inAirControlAcceleration, curSmooth);
		}
		
		// Jumping
		if ((movement.verticalSpeed > 0.0) && (jump.jumpingLevel > 0) && (jump.jumpingLevel <= jump.maxJumpingLevel)) {
			if (transform.position.y - jump.lastStartHeight < jump.minHeight) {
				movement.verticalSpeed = jump.firstJumpForce;
			} else if ((Input.GetButton("Jump") || jump.mobileTimer > 0.0f) && 
				(transform.position.y - jump.lastStartHeight < jump.maxHeight*jump.jumpingLevel)) {
					movement.verticalSpeed = jump.secondJumpForce;
					jump.mobileTimer -= Time.deltaTime;
			} else {
				movement.verticalSpeed *= jump.stickiness;
			} 
		}
		
		// Bounce off ceilings
		if (IsTouchingCeiling() && movement.verticalSpeed > 0.0) {
			movement.verticalSpeed *= -jump.ceilingRestitution;
		}
		
		CanClimbRight();
		
		
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


function IsWalking () {
	return movement.isWalking;
}

function IsJumping() {
	return !controller.isGrounded && !movement.falling;
}

function IsFalling() {
	return movement.falling;
}

function IsTouchingCeiling() {
	return (movement.collisionFlags & CollisionFlags.CollidedAbove) != 0;
}

function CanClimbRight() {
	var rightRay : Ray = new Ray(transform.position, Vector3(1.0f, 0.0f, 0.0f));
	var hit: RaycastHit;
	if (collider.Raycast(rightRay, hit, 100.0)) {
		Debug.DrawLine(rightRay.origin, hit.point);
	}
}

private function CorrectTexture() {
	if (gameObject.layer == LayerMask.NameToLayer("LightWorld")) {
		transform.Find("AvatarArmature").Find("Root").renderer.material.mainTexture = lightTexture;
	} else if (gameObject.layer == LayerMask.NameToLayer("DarkWorld")) {
		transform.Find("AvatarArmature").Find("Root").renderer.material.mainTexture = darkTexture;
	}
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
	movement.horizontalSpeed = 0.0;
}

//////////////////////////////
// Helper Functions END
//////////////////////////////

// Require a character controller to be attached to the same game object
@script RequireComponent(CharacterController)

// Put the script in the menu
@script AddComponentMenu("2D Platformer/Avatar Controller")
