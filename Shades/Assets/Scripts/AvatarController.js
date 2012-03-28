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
	var walkSpeed = 3.0;
	// Could add more types of speed here if we want (ex: runSpeed, rollerBladeSpeed, etc...)

	var inAirControlAcceleration = 1.0; // Decrease to make the character harder to shift in the air

	// The gravity for the character
	var gravity = 60.0;
	var terminalVelocity = 20.0;

	// How fast does the character change speeds?  Higher is faster.
	var speedSmoothing = 5.0;

	// The current move direction in x-y.  This will always be (1,0,0) or (-1,0,0)
	// The next line, @System.NonSerialized , tells Unity to not serialize the variable or show it in the inspector view.  Very handy for organization!
	@System.NonSerialized
	var direction = Vector3.zero;

	// The current vertical speed
	@System.NonSerialized
	var verticalSpeed = 0.0;

	// The current movement speed.  This gets smoothed by speedSmoothing.
	@System.NonSerialized
	var speed = 0.0;

	// Is the user pressing the left or right movement keys?
	@System.NonSerialized
	var isBeingSteered = false;

	// The last collision flags returned from controller.Move
	@System.NonSerialized
	var collisionFlags : CollisionFlags; 

	// We will keep track of an approximation of the character's current velocity, so that we return it from GetVelocity () for our camera to use for prediction.
	@System.NonSerialized
	var velocity : Vector3;
	
	// This keeps track of our current velocity while we're not grounded?
	@System.NonSerialized
	var inAirVelocity = Vector3.zero;

	// This will keep track of how long we have we been in the air (not grounded)
	@System.NonSerialized
	var hangTime = 0.0;
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
	var repeatTime = 0.05;

	// The time you have to wait before pressing the jump button again, in seconds
	//@System.NonSerialized
	var timeout = 0.15;

	// Are we jumping? (Initiated with jump button and not grounded yet)
	@System.NonSerialized
	var jumping = false;
	
	@System.NonSerialized
	var reachedApex = false;
  
	// Last time the jump button was clicked down
	@System.NonSerialized
	var lastButtonTime = -10.0;
	
	// Last time we performed a jump
	@System.NonSerialized
	var lastTime = -repeatTime; // Set to negative so the avatar can jump right from the beginning
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
	movement.direction = transform.TransformDirection (Vector3.forward);
	controller = GetComponent (CharacterController);
		
	// Always ignore physics of world avatar is not in. XXX: Not sure if this is the right place to put this code...
	Physics.IgnoreLayerCollision(LayerMask.NameToLayer("DarkWorld"),LayerMask.NameToLayer("LightWorld"),true);
	Physics.IgnoreLayerCollision(LayerMask.NameToLayer("LightWorld"),LayerMask.NameToLayer("DarkWorld"),true);
	
	//Spawn (); // TODO: Enable this and set a spawn point
}

// Call this whenever you want the character to respawn at the spawn point
function Spawn () {
	// reset the character's speed
	movement.verticalSpeed = 0.0;
	movement.speed = 0.0;
	
	// reset the character's position to the spawnPoint
	transform.position = spawnPoint.position;
	
}

// Call when died
function OnDeath () {
	// Respawn character at last spawn point
	Spawn ();
}

function UpdateSmoothedMovementDirection () {	
	var h = Input.GetAxisRaw ("Horizontal"); // This is nice because it means that an analog input device will have more control
	
	// Nullify user input if user input is disabled
	if (!canControl) {
		h = 0.0;
	}
	
	movement.isBeingSteered = Mathf.Abs (h) > 0.1;
		
	if (movement.isBeingSteered)
		movement.direction = Vector3 (h, 0, 0);
	
	// Grounded controls
	if (controller.isGrounded) {
		// Smooth the speed based on the current target direction
		var curSmooth = movement.speedSmoothing * Time.deltaTime;
		
		// Choose target speed
		var targetSpeed = Mathf.Min(Mathf.Abs(h), 1.0);
	
		// Pick speed modifier (if we are moving at a different pace for some reason)
		/*if (Input.GetButton ("Fire2") && canControl)
			targetSpeed *= movement.runSpeed;
		else*/
		targetSpeed *= movement.walkSpeed;
		
		//This will prevent jerky movement by smoothly moving the avatar at an ever increasing speed up to targetSpeed
		movement.speed = Mathf.Lerp(movement.speed, targetSpeed, curSmooth);
		
		// If the avatar is on the ground, it hasn't been in the air for any time at all
		movement.hangTime = 0.0;
	}
	// In air controls
	else {
		// Since the avatar is in the air, the hang time is increased by the appropriate amount
		movement.hangTime += Time.deltaTime;
		if (movement.isBeingSteered) {
			movement.inAirVelocity += Vector3(Mathf.Sign(h), 0, 0) * movement.inAirControlAcceleration * Time.deltaTime;
		}
	}
}

// Call when jump button is pressed
function ApplyJumping () {
	// Jumping is limited such that the avatar won't jump immediately after it alreay jumped
	// However, if you press the jump button while the character is in the air, it will jump after it lands
	// and after the minimum delay specified by jump.repeatTime from landing

	// Prevent jumping right after the avatar has landed
	if (jump.lastTime + jump.repeatTime > Time.time)
		return;

	if (controller.isGrounded) {
		// Jump
		// - Only when pressing the button down
		// - With a timeout so you can press the button slightly before landing		
		if (jump.enabled && (Time.time < (jump.lastButtonTime + jump.timeout))) {
			movement.verticalSpeed = CalculateJumpVerticalSpeed(jump.minHeight);
			//movement.inAirVelocity = lastPlatformVelocity; // XXX: need this if we are standing on a moving platform and have some speed already
			SendMessage("DidJump", SendMessageOptions.DontRequireReceiver);
		}
	}
}

function ApplyGravity () {
	// Apply gravity
	var jumpButton = Input.GetButton("Jump");
	
	// Cutout controls if they are disabled
	if (!canControl) {
		jumpButton = false;
	}
	
	// When we reach the apex of the jump (no longer moving up) we send out a message
	if (jump.jumping && !jump.reachedApex && movement.verticalSpeed <= 0.0) {
		jump.reachedApex = true;
		SendMessage("DidJumpReachApex", SendMessageOptions.DontRequireReceiver);
	}
	
	//XXX: I'm not sure this gives us the behavior we want - open for exploration
	// * When jumping up we don't apply gravity for some time when the user is holding the jump button
	//   This gives more control over jump height by pressing the button longer
	var isHigherJump = jump.jumping && 
						 (movement.verticalSpeed > 0.0) && 
						 jumpButton && 
						 (transform.position.y < jump.lastStartHeight + jump.maxHeight) &&
						 !IsTouchingCeiling();
	
	if (isHigherJump) {
		return;
	} else if (controller.isGrounded) {
		movement.verticalSpeed = -movement.gravity * Time.deltaTime;
	} else {
		movement.verticalSpeed -= movement.gravity * Time.deltaTime;
	}
		
	// Make sure we don't fall any faster than terminalVelocity. 
	movement.verticalSpeed = Mathf.Max(movement.verticalSpeed, -movement.terminalVelocity);
}

function CalculateJumpVerticalSpeed (targetJumpHeight : float) {
	// From the jump height and gravity we deduce the upwards speed 
	// needed for the character to reach the apex.
	return Mathf.Sqrt(2 * targetJumpHeight * movement.gravity);
}

function DidJump () {
	jump.jumping = true;
	jump.reachedApex = false;
	jump.lastTime = Time.time;
	jump.lastStartHeight = transform.position.y;
	jump.lastButtonTime = -10; // XXX: WHAT????
}


function Update () {
	if (Input.GetButtonDown("Jump") && canControl) {
		jump.lastButtonTime = Time.time;
	}

	UpdateSmoothedMovementDirection();
	
	// Apply gravity
	// - note that gravity is modified if you hold down jump to jump higher
	ApplyGravity();

	// Apply jumping logic
	ApplyJumping();
	
	// Moving platform support
	/*
	if (activePlatform != null) {
		var newGlobalPlatformPoint = activePlatform.TransformPoint(activeLocalPlatformPoint);
		var moveDistance = (newGlobalPlatformPoint - activeGlobalPlatformPoint);
		transform.position = transform.position + moveDistance;
		lastPlatformVelocity = (newGlobalPlatformPoint - activeGlobalPlatformPoint) / Time.deltaTime;
	} else {
		lastPlatformVelocity = Vector3.zero;	
	}
	
	activePlatform = null;*/
	
	// Save lastPosition for velocity calculation.
	var lastPosition = transform.position;
	
	// Calculate actual motion
	var currentMovementOffset = movement.direction * movement.speed + Vector3(0, movement.verticalSpeed, 0) + movement.inAirVelocity;
	
	// We always want the movement to be framerate independent.  Multiplying by Time.deltaTime does this.
	currentMovementOffset *= Time.deltaTime;
	
   	// Move our character!
	movement.collisionFlags = controller.Move(currentMovementOffset);
	
	// Calculate the velocity based on the current and previous position.  
	// This means our velocity will only be the amount the character actually moved as a result of collisions.
	movement.velocity = (transform.position - lastPosition) / Time.deltaTime;
	
	// Moving platforms support
	/*
	if (activePlatform != null) {
		activeGlobalPlatformPoint = transform.position;
		activeLocalPlatformPoint = activePlatform.InverseTransformPoint (transform.position);
	}*/
	
	/*
	// Set rotation to the move direction	
	if (movement.direction.sqrMagnitude > 0.01) {
		transform.rotation = Quaternion.Slerp (transform.rotation, Quaternion.LookRotation(movement.direction), Time.deltaTime * movement.rotationSmoothing);
	}*/
	
	// We are in jump mode but just became grounded
	if (controller.isGrounded) {
		movement.inAirVelocity = Vector3.zero;
		if (jump.jumping) {
			jump.jumping = false;
			SendMessage("DidLand", SendMessageOptions.DontRequireReceiver);

			var jumpMoveDirection = movement.direction * movement.speed + movement.inAirVelocity;
			if(jumpMoveDirection.sqrMagnitude > 0.01) {
				movement.direction = jumpMoveDirection.normalized;
			}
		}
	}	

}



//For dealing with moving platforms
/*function OnControllerColliderHit (hit : ControllerColliderHit)
{
	if (hit.moveDirection.y > 0.01) 
		return;
	
	// Make sure we are really standing on a straight platform
	// Not on the underside of one and not falling down from it either!
	if (hit.moveDirection.y < -0.9 && hit.normal.y > 0.9) {
		activePlatform = hit.collider.transform;	
	}
}*/


//////////////////////////////
// Helper Functions START
//////////////////////////////
function GetSpeed () {
	return movement.speed;
}

function GetVelocity () {
	return movement.velocity;
}


function IsMoving () {
	return movement.isBeingSteered;
}

function IsJumping () {
	return jump.jumping;
}

function IsTouchingCeiling () {
	return (movement.collisionFlags & CollisionFlags.CollidedAbove) != 0;
}

function GetDirection () {
	return movement.direction;
}

function GetHangTime() {
	return movement.hangTime;
}

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