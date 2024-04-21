export class DockerError extends Error {
    constructor(message) {
        super(message);
        this.name = "DockerError";
    }
}

