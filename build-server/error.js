export class DockerError extends Error {
    constructor(message) {
        super(message);
        this.name = "DockerError";
    }
}


export class DeploymentError extends Error {
    constructor(message) {
        super(message);
        this.name = "DeploymentError";
    }
}

