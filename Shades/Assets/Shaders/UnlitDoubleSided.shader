// Unlit alpha-blended shader.
// - no lighting
// - no lightmap support
// - no per-material color
// - no culling

Shader "Unlit/Transparent/NotCulled" {
Properties {
	_MainTex ("Base (RGB) Trans (A)", 2D) = "white" {}
}

SubShader {
	Tags {"Queue"="Transparent" "IgnoreProjector"="True" "RenderType"="Transparent"}
	LOD 100
	
	Cull Off
	ZWrite Off
	Blend SrcAlpha OneMinusSrcAlpha 

	Pass {
		Lighting Off
		SetTexture [_MainTex] { combine texture } 
	}
}
}
