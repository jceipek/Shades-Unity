#pragma strict

function Update() {
	for (var touch : Touch in Input.touches) {
		var ray : Ray = Camera.main.ScreenPointToRay(touch.position);
        var hit : RaycastHit;
        if (Physics.Raycast (ray, hit, 100.0f)) {
             hit.transform.SendMessage("Clicked");
       	}
	}
}