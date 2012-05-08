#pragma strict

var state : boolean = false; // In what state does the lever start? Deactivated is Left; Activated is Right
var animSpeed : float = 1.0f; // How fast does the lever animation play?
var activateWithActionButton : boolean = true; // Can the lever be activated by the player pressing the Action button while in range?
var canDeactivate : boolean = true; // Can the lever's position be reset once it has been pushed away from its start position?
var simpleToggleBehavior : boolean = true; // Does the lever just toggle the state of the item it's connected to?
										   // If not, it behaves as follows:
										   // Lever ON Object ON -> Object OFF
										   // Lever OFF Object ON -> No Change
										   // Lever ON Object OFF -> No Change
										   // Lever OFF Object OFF -> Object ON
										   // Object ON = Object's initial state
var syncWithTarget : boolean = true; // If the Object changes due to an outside force, toggle the lever automatically

var targetPlatform : PlatformController;

private var avatarInBounds = false; // Keeps track of whether avatar is in range of lever
private var originalState : boolean; // What state did the lever start out in? Used by canDeactivate

function Awake() {
	originalState = state;
	if (!state) {
		animation["Left"].time = 0.0;
		animation["Left"].enabled = true;
	} else {
		animation["Right"].time = 0.0;
		animation["Right"].enabled = true;
	}
    
	var right = animation["Right"];
	var left = animation["Left"];
	left.speed *= animSpeed;
	right.speed *= animSpeed;
	
	targetPlatform.SendMessage("AddAgent", gameObject);
}

function OnTriggerEnter(other : Collider) {
	if (other.tag == "Player") {
		avatarInBounds = true;
	} else if (other.tag == "Enemy") {
		Switch();
	}
}

function OnTriggerExit(other : Collider) {
	if (other.tag == "Player") {
		avatarInBounds = false;
	}
}

function Update() {
	if (activateWithActionButton && avatarInBounds && Input.GetButtonDown("Action")) {
		if (canDeactivate || (state == originalState)) {
			Switch();
		}
	}
}

// Called as consequence of outside force
function Switch() {
	_Switch();
	
	if (simpleToggleBehavior) {
		targetPlatform.gameObject.SendMessage("LeverToggledBy", gameObject.GetInstanceID());
	} else {
		targetPlatform.gameObject.SendMessage("LeverFlippedInitialToBy", new Array(originalState, state, gameObject.GetInstanceID()));
	}	
}

// Called whenever lever state is to be changed without informing targets
private function _Switch() {
	if (state) {
		animation.CrossFade("Left");
	} else {
		animation.CrossFade("Right");
	}
	
	state = !state;
}

function TargetChangedByAgent(agentID : int) {
	if (gameObject.GetInstanceID() != agentID && syncWithTarget) {
		if (syncWithTarget) {
			_Switch();
		}
	}
}

function OnDrawGizmosSelected()
{
	//boxCollider = GetComponent(BoxCollider);
	Gizmos.color = Color.blue;
    //Gizmos.DrawIcon(boxCollider.center+transform.position, "skull icon.png", true);
    //Gizmos.DrawCube(boxCollider.center+transform.position, boxCollider.size);
    Gizmos.DrawLine(transform.position, targetPlatform.transform.position);
}