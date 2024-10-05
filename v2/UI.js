class UI {
    constructor(gl, camera, light, icosModel, nameModel, mouseFX) {
        this.gl = gl;           //Do I need ???
        this.camera = camera;
        this.light = light;
        this.icosModel = icosModel;
        this.nameModel = nameModel;
        this.mouseFX = mouseFX;

        // CAMERA
        const camPos = this.camera.transform.position;
        document.getElementById("cam-pos-x").addEventListener("change", (e) => {
            camPos.set(parseFloat(e.target.value), camPos.y, camPos.z);
        });
        document.getElementById("cam-pos-y").addEventListener("change", (e) => {
            camPos.set(camPos.x, parseFloat(e.target.value), camPos.z);
        });
        document.getElementById("cam-pos-z").addEventListener("change", (e) => {
            camPos.set(camPos.x, camPos.y, parseFloat(e.target.value));
        });

        document.getElementById("cam-fov").addEventListener("change", (e) => {
            this.camera.fov = parseFloat(e.target.value); 
        });

        // LIGHT
        const lightPos = this.light.transform.position;
        document.getElementById("light-pos-x").addEventListener("change", (e) => {
            lightPos.set(parseFloat(e.target.value), lightPos.y, lightPos.z);
        });
        document.getElementById("light-pos-y").addEventListener("change", (e) => {
            lightPos.set(lightPos.x, parseFloat(e.target.value), lightPos.z);
        });
        document.getElementById("light-pos-z").addEventListener("change", (e) => {
            lightPos.set(lightPos.x, lightPos.y, parseFloat(e.target.value));
        });

        document.getElementById("light-intensity").addEventListener("change", (e) => {
            this.light.setIntensity(e.target.value);
        });

        document.getElementById("light-color-r").addEventListener("change", (e) => {
            this.light.setColor(parseFloat(e.target.value), this.light.color.y, this.light.color.z);
        });
        document.getElementById("light-color-g").addEventListener("change", (e) => {
            this.light.setColor(this.light.color.x, parseFloat(e.target.value), this.light.color.z);
        });
        document.getElementById("light-color-b").addEventListener("change", (e) => {
            this.light.setColor(this.light.color.x, this.light.color.y, parseFloat(e.target.value));
        });

        // ICOS MODEL
        const icosPos = this.icosModel.transform.position;
        document.getElementById("icos-pos-x").addEventListener("change", (e) => {
            this.icosModel.setPosition(parseFloat(e.target.value), icosPos.y, icosPos.z)
                .transform.updateMatrix();
        });
        document.getElementById("icos-pos-y").addEventListener("change", (e) => {
            this.icosModel.setPosition(icosPos.x, parseFloat(e.target.value), icosPos.z)
                .transform.updateMatrix();
        });
        document.getElementById("icos-pos-z").addEventListener("change", (e) => {
            this.icosModel.setPosition(icosPos.x, icosPos.y, parseFloat(e.target.value))
                .transform.updateMatrix();
        });

        document.getElementById("icos-scale").addEventListener("change", (e) => {
            this.icosModel.setScale(parseFloat(e.target.value), parseFloat(e.target.value), parseFloat(e.target.value))
                .transform.updateMatrix();
        });

        // NAME MODEL
        const namePos = this.nameModel.transform.position;
        document.getElementById("name-pos-x").addEventListener("change", (e) => {
            this.nameModel.setPosition(parseFloat(e.target.value), namePos.y, namePos.z)
                .transform.updateMatrix();
        });
        document.getElementById("name-pos-y").addEventListener("change", (e) => {
            this.nameModel.setPosition(namePos.x, parseFloat(e.target.value), namePos.z)
                .transform.updateMatrix();
        });
        document.getElementById("name-pos-z").addEventListener("change", (e) => {
            this.nameModel.setPosition(namePos.x, namePos.y, parseFloat(e.target.value))
                .transform.updateMatrix();
        });

        document.getElementById("name-scale").addEventListener("change", (e) => {
            this.nameModel.setScale(parseFloat(e.target.value), parseFloat(e.target.value), parseFloat(e.target.value))
                .transform.updateMatrix();
        });

    }
}