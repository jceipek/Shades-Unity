#pragma downcast

var darkMaterial : Material;
var lightMaterial : Material;

private var startingWorld;

function Update() {

}

function Awake() {
	startingWorld = gameObject.layer;
	CorrectMaterial();
}

function ChangeWorldTo(layer : int) {
	gameObject.layer = layer;
	CorrectMaterial();
}

private function CorrectMaterial() {
	if (gameObject.layer == LayerMask.NameToLayer("LightWorld")) {
		transform.Find("PlatformObj").renderer.material = lightMaterial;
	} else if (gameObject.layer == LayerMask.NameToLayer("DarkWorld")) {
		transform.Find("PlatformObj").renderer.material = darkMaterial;
	}
}

function LeverFlippedInitialTo(initNewState: Array) {
	var initialState : boolean = initNewState[0];
	var newState : boolean = initNewState[1];
	
	var layerToChangeTo : int;
	if (initialState != newState) {
		if (gameObject.layer == LayerMask.NameToLayer("LightWorld")) {
			layerToChangeTo = LayerMask.NameToLayer("DarkWorld");
		} else if (gameObject.layer == LayerMask.NameToLayer("DarkWorld")) {
			layerToChangeTo = LayerMask.NameToLayer("LightWorld");
		}
	} else {
		layerToChangeTo = startingWorld;
	}
	if (gameObject.layer != layerToChangeTo) {
		ChangeWorldTo(layerToChangeTo);
	}
}