/// <reference path="babylon.d.ts" />

// stats.js implementation and styling
var stats = new Stats();
stats.dom.classList.add("statsdom");
document.body.appendChild(stats.dom);
document.querySelectorAll(".statsdom")[0].setAttribute("style", "");
// declaration
cellmeshes = [];
roundbtns = document.querySelectorAll(".smlbtns");
mitosmlbtns = document.querySelectorAll(".mitosmlbtns");
backcell = document.getElementById("backcell");
let cellref = 0;
let memref = 0;
let phoref = 0;
const canvas = document.getElementById("babcanv"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true);
function showui() {
    engine.displayLoadingUI();
}

showui();

function hideui() {
    engine.hideLoadingUI();
}

// function to hide button
function hidebtn(psbtn) {
    psbtn.setAttribute("style", ""); // resets inline styling
    psbtn.classList.remove("animbtn"); // removes class
    psbtn.classList.add("animobtn"); // adds class
}

// function to show button
function showbtn(psbtn) {
    psbtn.setAttribute("style", ""); // resets inline stying
    if (psbtn.classList.contains("animobtn")) {
        psbtn.classList.remove("animobtn"); // removes class based on if the button has that class
    }
    psbtn.classList.add("animbtn"); // adds a class
}

// // adds class to each item in loop
mitosmlbtns.forEach((el) => {
    el.classList.add("animobtn");
});
roundbtns.forEach((el) => {
    el.classList.add("animobtn");
});
backcell.classList.add("animobtn");

// sets up actions to be triggered when the pointer (mouse cursor) hovers over and moves away from the 3D object
function orgsettings(psorg) {
    psorg.actionManager.registerAction(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPointerOverTrigger, psorg.material, "diffuseColor", new BABYLON.Color3(0, 1, 0), 500)); // when the pointer hovers over the object, its material's diffuseColor will transition to green for 500 milliseconds
    psorg.actionManager.registerAction(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPointerOutTrigger, psorg.material, "diffuseColor", new BABYLON.Color3(1, 1, 1), 500)); // when the pointer moves away, the diffuseColor will transition back to white for 500 milliseconds
}

// sets element at index 'ind' to be semi-transparent and have a 'not allowed' cursor, all other elements in cellmeshes and roundbtns are hidden
function clickcond(ind) {
    for (i = 0; i < cellmeshes.length; i++) {
        cellmeshes[i].visibility = 0;
    }
    for (i = 0; i < roundbtns.length; i++) {
        if (i != ind) {
            hidebtn(roundbtns[i]);
        } else {
            roundbtns[i].setAttribute("style", "opacity: 0.6 !important; cursor: not-allowed !important;");
        }
    }
}

// sets element at index 'ind' to be semi-transparent and have a 'not allowed' cursor, all other elements in cellmeshes and mitosmlbtns are hidden
function clickcondmito(ind) {
    for (i = 0; i < cellmeshes.length; i++) {
        cellmeshes[i].visibility = 0;
    }
    for (i = 0; i < mitosmlbtns.length; i++) {
        if (i != ind) {
            hidebtn(mitosmlbtns[i]);
        } else {
            mitosmlbtns[i].setAttribute("style", "opacity: 0.6 !important; cursor: not-allowed !important;");
        }
    }
}

// checks visibility of ind element in roundbtns
function checkvis(ind) {
    if (!roundbtns[ind].classList.contains("animobtn") && roundbtns[ind].getAttribute("style") != "opacity: 0.6 !important; cursor: not-allowed !important;") {
        return true;
    }
    return false;
}

// checks visibility of ind element in mitosmlbtns
function checkvismito(ind) {
    if (!mitosmlbtns[ind].classList.contains("animobtn") && mitosmlbtns[ind].getAttribute("style") != "opacity: 0.6 !important; cursor: not-allowed !important;") {
        return true;
    }
    return false;
}


function bckcell() {
    if (!backcell.classList.contains("animobtn")) {
        hidebtn(backcell); 
        for (i = 0; i < cellmeshes.length; i++) {
            cellmeshes[i].visibility = 1;
        }
        showui();
        camera.lowerRadiusLimit = 5; // sets minimum allowed distance from the camera's target (the point it's looking at) to the camera
        BABYLON.SceneLoader.ImportMesh("", "", "animal_cell.glb", scene, function (meshes) { // imports 3D mesh
            // deletes the memref and phoref variables if they exist
            try {
                memref.dispose();
            } catch (err) {}
            try {
                phoref.dispose();
            } catch (err) {}
            camera.target = meshes[0]; // camera targets first element in meshes array
            hideui();
            cellref = meshes[0];
        });
    }
}

var createScene = function (canvas, engine) {
    var scene = new BABYLON.Scene(engine); // creates new scene

    camera = new BABYLON.ArcRotateCamera("camera", -10, -100, 5, new BABYLON.Vector3.Zero(), scene); // creates ArcRotateCamera with initial positions and target

    camera.setTarget(BABYLON.Vector3.Zero()); // sets target to origin of model

    camera.attachControl(canvas, true); // attaches camera controls to the canvas, allowing users to interact with the scene using mouse and touch controls

    camera.wheelPrecision = 50; // sets wheel precision for when scrolling with mouse

    // upper and lower bounds for camera distance from model
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 20;

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene); // adds shining light effect

    light.intensity = 0.7; // sets intesity of light

    BABYLON.SceneLoader.ImportMesh("", "", "animal_cell.glb", scene, function (meshes) { // imports mesh from animal_cell.glb
        camera.target = meshes[0]; // sets camera target to first element of meshes array
        hideui();
        cellref = meshes[0]; 
    });

    memmat = new BABYLON.StandardMaterial("mat", scene);

    // Creates parts of the cells using .CreateSphere and handles what to do when the user clicks on that part of the cell
    const membrane = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 0.25, segments: 32 }, scene);
    membrane.position.set(0, 0, 3.8);
    membrane.material = memmat;
    cellmeshes.push(membrane); // adds membrane to cellmeshes array
    membrane.actionManager = new BABYLON.ActionManager(scene);
    membrane.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
            camera.lowerRadiusLimit = 2;
            Swal.fire({
                title: "Cell Membrane",
                text: "Phospholipids have 2 unsaturated fatty acid tails and one head. The phospholipid head is hydrophilic(water-loving) and the 2 unsaturated fatty acid tails are hydrophobic(Fear of water). Phospholipid tails are hydrophobic because they are composed of many hydrogens and carbons meaning     Phospholipids have these kinks and bends in their membrane. This allows the inside of the membrane to be fluid.",
                icon: "question",
                background: "black",
                color: "white",
                imageUrl: "cellmembrane.png",
                imageWidth: window.innerWidth * 0.5,
                imageHeight: window.innerHeight * 0.5,
                width: window.innerWidth * 0.8,
                backdrop: false,
            }).then(function () {
                for (i = 0; i < roundbtns.length; i++) {
                    hidebtn(roundbtns[i]);
                }
            });
            for (i = 0; i < roundbtns.length; i++) {
                showbtn(roundbtns[i]);
            }
            camera.target = membrane;
            camera.inertialRadiusOffset += 4;
        })
    );

    mitomat = new BABYLON.StandardMaterial("mito", scene);

    mito = BABYLON.MeshBuilder.CreateSphere("mito", { diameter: 0.25, segments: 32 }, scene);
    cellmeshes.push(mito);
    mito.position.set(0.4, 0.2, 3.3);
    mito.material = mitomat;
    mito.actionManager = new BABYLON.ActionManager(scene);
    mito.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
            camera.lowerRadiusLimit = 2;
            Swal.fire({
                title: "Cell Mitochondria",
                text: "Description",
                icon: "question",
                background: "black",
                color: "white",
                backdrop: false,
            }).then(function () {
                for (i = 0; i < mitosmlbtns.length; i++) {
                    hidebtn(mitosmlbtns[i]);
                }
            });
            for (i = 0; i < mitosmlbtns.length; i++) {
                showbtn(mitosmlbtns[i]);
            }
            camera.target = mito;
            camera.inertialRadiusOffset += 4;
        })
    );

    nucmat = new BABYLON.StandardMaterial("nuc", scene);

    nucleus = BABYLON.MeshBuilder.CreateSphere("nucleus", { diameter: 0.25, segments: 32 }, scene);
    cellmeshes.push(nucleus);
    nucleus.material = nucmat;
    nucleus.position.set(0.3, 0.2, 0);
    nucleus.actionManager = new BABYLON.ActionManager(scene);
    nucleus.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
            camera.lowerRadiusLimit = 2;
            Swal.fire({
                title: "Cell Nucleus",
                text: "Description",
                icon: "question",
                background: "black",
                color: "white",
                backdrop: false,
            });
            camera.target = nucleus;
            camera.inertialRadiusOffset += 4;
        })
    );

    gogmat = new BABYLON.StandardMaterial("gog", scene);

    golgi = BABYLON.MeshBuilder.CreateSphere("golgi", { diameter: 0.25, segments: 32 }, scene);
    cellmeshes.push(golgi);
    golgi.position.set(-1.3, 0.2, 1.7);
    golgi.material = gogmat;
    golgi.actionManager = new BABYLON.ActionManager(scene);
    golgi.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
            camera.lowerRadiusLimit = 2;
            Swal.fire({
                title: "Cell Golgi",
                text: "Description",
                icon: "question",
                background: "black",
                color: "white",
                backdrop: false,
            });
            camera.target = golgi;
            camera.inertialRadiusOffset += 4;
        })
    );

    // tells each item in the cellmeshes array what to do when the mouse cursor hovers over and moves away from the part

    for (i = 0; i < cellmeshes.length; i++) {
        orgsettings(cellmeshes[i]);
    }
    return scene;
};

// handles the cases of when user clicks on the parts of the cell
function membraneclicked() {
    if (checkvis(0)) { // checks visibility
        showui(); 
        clickcond(0); // has the membrane be semi-transparent and have a not allowed cursor
        BABYLON.SceneLoader.ImportMesh("", "", "cell_membrane.glb", scene, function (meshes) { // imports 3D model
            cellref.dispose(); // rids of cellref
            hideui();
            camera.target = meshes[0]; // sets camera target
            memref = meshes[0]; // sets reference of this membrane to memref
        });
        showbtn(backcell);
    }
}

function phosphoclicked() {
    if (checkvis(1)) {
        showui();
        clickcond(1);
        BABYLON.SceneLoader.ImportMesh("", "", "phospho_sama.glb", scene, function (meshes) {
            cellref.dispose();
            hideui();
            camera.target = meshes[0];
            // meshes[0].scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
            phoref = meshes[0];
        });
        showbtn(backcell);
    }
}

function phosphoclicked2() {
    if (checkvis(2)) {
        document.getElementById("swal2-html-container").innerHTML = "<ul>Selective permeability</ul><ul>Passive transport</ul><ul>Active transport</ul><ul>Facilitated transport</ul>";
        showui();
        clickcond(2);
        BABYLON.SceneLoader.ImportMesh("", "", "phospholipid.glb", scene, function (meshes) {
            cellref.dispose();
            hideui();
            meshes[0].scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
            camera.target = meshes[0];
            // meshes[0].scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
            phoref = meshes[0];
        });
        showbtn(backcell);
    }
}

function loadmito() {
    if (checkvismito(0)) {
        showui();
        clickcondmito(0);
        BABYLON.SceneLoader.ImportMesh("", "", "mitocondrias.glb", scene, function (meshes) {
            cellref.dispose();
            hideui();
            camera.target = meshes[0];
            meshes[0].scaling = new BABYLON.Vector3(5, 5, 5);
            phoref = meshes[0];
        });
        showbtn(backcell);
    }
}

const scene = createScene();

engine.runRenderLoop(function () {
    scene.render();
    stats.update();
});

window.addEventListener("resize", function () {
    engine.resize();
});
