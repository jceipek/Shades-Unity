#pragma strict

var selectedTexture : Texture;
var deselectedTexture : Texture;

function OnMouseDown () {
    SendMessage("Clicked");
}

function OnMouseEnter () {
    renderer.material.mainTexture = selectedTexture;
}

function OnMouseExit () {
    renderer.material.mainTexture = deselectedTexture;
}

// Require a box collider for the trigger
@script RequireComponent(BoxCollider)