#pragma strict

private var boxCollider : BoxCollider;

var triggerSave = false;

// Whoever enters the DeathTrigger gets an OnDeath message sent to them.
// They don't have to react to it.
function OnTriggerEnter (other : Collider) {
	//other.gameObject.SendMessage ("OnDeath", SendMessageOptions.DontRequireReceiver);
	
	if (triggerSave) {
		other.gameObject.SendMessage("SetSpawnPointTo", gameObject);
	}
}

function OnDrawGizmos()
{
	boxCollider = GetComponent(BoxCollider);
	Gizmos.color = Color.blue;
	if (gameObject.layer == LayerMask.NameToLayer("DarkWorld")) {
		Gizmos.DrawIcon(boxCollider.center+transform.position, "spawn point black icon.png", true);
	} else if (gameObject.layer == LayerMask.NameToLayer("LightWorld")) {
    	Gizmos.DrawIcon(boxCollider.center+transform.position, "spawn point white icon.png", true);
    } else {
    	Gizmos.DrawIcon(boxCollider.center+transform.position, "spawn point gray icon.png", true);    
    }
    Gizmos.DrawWireCube(boxCollider.center+transform.position, boxCollider.size);
}

// Require a box collider for the trigger
@script RequireComponent(BoxCollider)
