// Adjusts the speed at which the walk animation is played back
// Adjusts the speed at which the run animation is played back
//var runAnimationSpeedModifier = 1.5;
// Adjusts the speed at which the jump animation is played back
//var jumpAnimationSpeedModifier = 2.0;
// Adjusts the speed at which the hang time animation is played back
//var jumpLandAnimationSpeedModifier = 3.0;

// Adjusts after how long the falling animation will be 
var hangTimeUntilFallingAnimation = 0.05;



//private var jumping = false;

class AvatarAnimationSpeed {
	var walkSpeedModifier = 2.5;
	var jumpSpeedModifier = 1.0;
	var fallSpeedModifier = 1.0;
	
	//@System.NonSerialized
	//var walkSpeedStd : float;

}
var animSpeed : AvatarAnimationSpeed;

class SoundClips {
	var walking : AudioClip;

}
var sounds : SoundClips;

function Start () {
	animation.Stop();

	// By default loop all animations
	animation.wrapMode = WrapMode.Loop;

	// Jump animation are in a higher layer:
	// Thus when a jump animation is playing it will automatically override all other animations until it is faded out.
	// This simplifies the animation script because we can just keep playing the walk / run / idle cycle without having to spcial case jumping animations.
	/*var jumpingLayer = 1;
	var jump = animation["jump"];
	jump.layer = jumpingLayer;
	jump.speed *= jumpAnimationSpeedModifier;
	jump.wrapMode = WrapMode.Once;
	
	var jumpFall = animation["jumpFall"];
	jumpFall.layer = jumpingLayer;
	jumpFall.wrapMode = WrapMode.ClampForever;

	var jumpLand = animation["jumpLand"];
	jumpLand.layer = jumpingLayer;
	jumpLand.speed *= jumpLandAnimationSpeedModifier;
	jumpLand.wrapMode = WrapMode.Once;

	var run = animation["run"];
	run.speed *= runAnimationSpeedModifier;
	*/
	
	var walk = animation["Walking"];
	//animSpeed.walkSpeedStd = walk.speed;
	walk.speed *= animSpeed.walkSpeedModifier;
	
	var jump = animation["Jumping"];
	jump.speed *= animSpeed.jumpSpeedModifier;
	
	var fall = animation["Falling"];
	fall.speed *= animSpeed.fallSpeedModifier;

}

function Update () {
	var controller : AvatarController = GetComponent(AvatarController);

	var effect : AudioSource = GetComponent(AudioSource);

	// We are not falling off the edge right now
	//if (controller.GetHangTime() < hangTimeUntilFallingAnimation) {
		// Are we moving the character?
		//animation["Walking"].speed = animSpeed.walkSpeedStd * animSpeed.walkSpeedModifier;
		if (!controller.IsJumping() && !controller.IsFalling()) {
			if (controller.IsWalking())
			{
				animation.wrapMode = WrapMode.Loop;
				animation.CrossFade("Walking");
				if (!effect.isPlaying || effect.clip != sounds.walking) {
					effect.clip = sounds.walking;
					effect.volume = 1.0f;
					effect.Play();
				}
			}
			// Go back to idle when not moving
			else {
				animation.wrapMode = WrapMode.Loop;
				animation.CrossFade("Idle");//, 0.5);
				FadeAudio(1.0f, Fade.Out);
				effect.Stop();
			}
		}
	//}
	// When falling off an edge, after hangTimeUntilFallingAnimation we will fade towards the ledgeFall animation
	//else {
		//animation.CrossFade ("ledgeFall");
	//}
}

function JumpInitiated() {
	animation.wrapMode = WrapMode.Once;
	animation.Play("Jumping");
}

function FallingInitiated() {
	animation.wrapMode = WrapMode.Once;
	animation.Blend("Falling");
}

//function DidJump () {
//	animation.Play ("jump");
//	animation.PlayQueued ("jumpFall");
//}

//function DidLand () {
//	animation.Stop ("jumpFall");
//	animation.Play ("jumpLand");
//	animation.Blend ("jumpLand", 0);
//}

private function FadeAudio (timer : float, fadeType : Fade) {

    var start = fadeType == Fade.In? 0.0 : 1.0;

    var end = fadeType == Fade.In? 1.0 : 0.0;

	var effect : AudioSource = GetComponent(AudioSource);

    var i = 0.0;

    var step = 1.0/timer;

 

    while (i <= 1.0) {

        i += step * Time.deltaTime;

        effect.volume = Mathf.Lerp(start, end, i);

        yield;

    }
    
    effect.Stop();

}