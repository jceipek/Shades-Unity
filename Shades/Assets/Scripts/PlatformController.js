#pragma downcast

var darkMaterial : Material;
var lightMaterial : Material;

private var startingWorld : int;
private var connectedAgents : Array = new Array();

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

function AddAgent(agent) {
	connectedAgents.Add(agent);
}

function LeverFlippedInitialToBy(initNewState: Array) {
	var initialState : boolean = initNewState[0];
	var newState : boolean = initNewState[1];
	var agentID : int = initNewState[2];
	
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
		for (var agent:GameObject in connectedAgents) {
			agent.SendMessage("TargetChangedByAgent", agentID);
		}
		
	}
}

function LeverToggledBy(agentID : int) {
	if (gameObject.layer == LayerMask.NameToLayer("LightWorld")) {
		ChangeWorldTo(LayerMask.NameToLayer("DarkWorld"));
	} else if (gameObject.layer == LayerMask.NameToLayer("DarkWorld")) {
		ChangeWorldTo(LayerMask.NameToLayer("LightWorld"));
	}
	for (var agent:GameObject in connectedAgents) {
		agent.SendMessage("TargetChangedByAgent", agentID);
	}
}