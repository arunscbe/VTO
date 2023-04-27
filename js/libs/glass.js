"use strict";

/*
    Build 3D glasses.
    spec properties: 
       * <string> envMapURL: url of the envMap
       * <string> frameMeshURL: url of the mesh used for the glasses frames
       * <string> lensesMeshURL: url of the mesh of the lenses
       * <string> occluderURL: url of the occluder
*/
const loader = new THREE.OBJLoader();
let frameMat,stickMat;
const JeelizThreeGlassesCreator=function(spec){

    //console.log("===>",spec);
    const threeGlasses = new THREE.Object3D();
    
    //enMap texture
    const textureEquirec = new THREE.TextureLoader().load( spec.envMapURL );
    textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
    textureEquirec.magFilter = THREE.LinearFilter;
    textureEquirec.minFilter = THREE.LinearMipMapLinearFilter;

     frameMat = new THREE.MeshPhongMaterial({
        map : new THREE.TextureLoader().load(specs[1].frame),
        transparent:true,
        envMap:textureEquirec,
        reflectivity: 0.5
       
    });
     stickMat = new THREE.MeshPhongMaterial({
        map : new THREE.TextureLoader().load(specs[1].stick),
        transparent:true,
        envMap:textureEquirec,
        reflectivity: 0.5
       
    });
    loader.load("models3D/glass.obj",function(object){
        object.traverse(function(child){
            if(child instanceof THREE.Mesh){
                if(child.name == "Frame"){
                    child.material = frameMat;
                }
                 else if(child.name == "Stick"){
                    child.material = stickMat;
                }
            }
        });
        threeGlasses.add(object);
    });

    //glasses frames:
    new THREE.BufferGeometryLoader().load(spec.frameMeshURL, function(glassesFramesGeometry){
        glassesFramesGeometry.computeVertexNormals();

        //custom material with fading at the end of the branches
        const uniforms = Object.assign(THREE.ShaderLib.basic.uniforms,
            {
                envMap: {value: textureEquirec},
                color: {value: new THREE.Color(0xf0f0f0)},
                uBranchFading: {value: new THREE.Vector2(-90,60)} //first value: position (lower -> to the back), second: transition brutality
            });

        //tweak vertex shader to give the Z of the current point
        var vertexShaderSource="varying float vPosZ;\n"+THREE.ShaderLib.basic.vertexShader;
        vertexShaderSource = vertexShaderSource.replace('#include <fog_vertex>', 'vPosZ=position.z;');

        //tweak fragment shader to apply transparency at the end of the branches
        var fragmentShaderSource="uniform vec2 uBranchFading;\n varying float vPosZ;\n"+THREE.ShaderLib.basic.fragmentShader;
        const GLSLcomputeAlpha = 'gl_FragColor.a=smoothstep(uBranchFading.x-uBranchFading.y*0.5, uBranchFading.x+uBranchFading.y*0.5, vPosZ);'
        fragmentShaderSource = fragmentShaderSource.replace('#include <fog_fragment>', GLSLcomputeAlpha);

        const mat  =new THREE.ShaderMaterial({
            vertexShader: vertexShaderSource,
            fragmentShader: fragmentShaderSource,
            uniforms: uniforms,
            transparent: true
        });
        mat.envMap = textureEquirec;
        const glassesFramesMesh = new THREE.Mesh(glassesFramesGeometry, mat);
     //   threeGlasses.add(glassesFramesMesh);
      //  window.m=mat;
    });

    //glasses lenses:
    new THREE.BufferGeometryLoader().load(spec.lensesMeshURL, function(glassesLensesGeometry){
        glassesLensesGeometry.computeVertexNormals();
        const mat= new THREE.MeshBasicMaterial({
            envMap: textureEquirec,
            opacity: 0.7,
            color: 0x2233aa,
            transparent: true
        });
      //  window.mat = mat;
        const glassesLensesMesh = new THREE.Mesh(glassesLensesGeometry, mat);
       // threeGlasses.add(glassesLensesMesh);
    });

    var geo = new THREE.BoxGeometry(10,10,10);
    var mat = new THREE.MeshLambertMaterial({color:0xffff00});
    var BOXMesh = new THREE.Mesh(geo , mat);
    BOXMesh.name ="Arun";
    threeGlasses.add(BOXMesh);
   
    const occluderMesh = THREE.JeelizHelper.create_threejsOccluder(spec.occluderURL);
    
    return {
        glasses: threeGlasses,
        occluder: occluderMesh,
       // mesh :BOXMesh
    };
}
