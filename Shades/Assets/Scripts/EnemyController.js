#pragma strict

var movementSpeed : float = 1.0f;
var gravity : float = 10.0f;

@System.NonSerialized
var avatar : GameObject;
//@System.NonSerialized
var direction : int = 1;
//@System.NonSerialized
var overPlatformBefore : boolean = false;
@System.NonSerialized
var movementOffset = Vector3(2, 0, 0);
@System.NonSerialized
var controller : CharacterController;
@System.NonSerialized
var collisionFlags : boolean;
//@System.NonSerialized
var overPlatform : boolean = true;
@System.NonSerialized
var rightLayer;


function Awake() {
	
	controller = GetComponent(CharacterController);
	
	avatar = GameObject.Find("Avatar");
	
	if (gameObject.layer == LayerMask.NameToLayer("LightWorld")) {
		rightLayer = LayerMask.NameToLayer("LightWorld");
	} else if (gameObject.layer == LayerMask.NameToLayer("DarkWorld")) {
		rightLayer = LayerMask.NameToLayer("DarkWorld");
	}
}

function Update() {
	var down = Vector3(0, -.5, 0);
	var hit : RaycastHit;
	
	overPlatform = Physics.Raycast(transform.position, down, hit, 2);
	
	if (!overPlatform) {
		if (overPlatformBefore) {
			direction *= -1;
			overPlatformBefore = false;
		}
		movementOffset += direction * gravity * down;
		
    } else {
		if (overPlatform) {
			if (hit.collider.gameObject.layer == rightLayer) {
				overPlatformBefore = true;
			} else {
				movementOffset += direction * gravity * down;
				if (overPlatformBefore) {
					direction = -direction;
				}
			}
		}
	}
	
	EnemyMove();
	
	var distance = Vector3.Distance(avatar.transform.position, transform.position);
	if (avatar.gameObject.layer == gameObject.layer) {
		if (distance < 3) {
			avatar.gameObject.SendMessage("OnDeath", SendMessageOptions.DontRequireReceiver);
		}
	}
}


function EnemyMove() {
	movementOffset *= movementSpeed * direction * Time.deltaTime;
	collisionFlags = controller.Move(movementOffset);
	movementOffset = Vector3(2, 0, 0);
}

function OnDrawGizmos()
{
	if (gameObject.layer == LayerMask.NameToLayer("DarkWorld")) {
    	Gizmos.DrawIcon(transform.position, "enemy dark icon.png", true);
    } else if (gameObject.layer == LayerMask.NameToLayer("LightWorld")) {
    	Gizmos.DrawIcon(transform.position, "enemy light icon.png", true);
    }
}