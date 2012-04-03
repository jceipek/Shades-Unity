#pragma strict

private var boxCollider : BoxCollider;

// Whoever enters the DeathTrigger gets an OnDeath message sent to them.
// They don't have to react to it.
function OnTriggerEnter (other : Collider) {
	other.gameObject.SendMessage ("OnDeath", SendMessageOptions.DontRequireReceiver);
}

function OnDrawGizmos()
{
	boxCollider = GetComponent(BoxCollider);
	Gizmos.color = Color.gray;
    Gizmos.DrawIcon(boxCollider.center+transform.position, "skull icon.png", true);
    Gizmos.DrawCube(boxCollider.center+transform.position, boxCollider.size);
}

// Require a box collider for the trigger
@script RequireComponent(BoxCollider)
