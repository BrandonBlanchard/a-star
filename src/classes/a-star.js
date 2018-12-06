import { debug } from "util";



export default class AStar {

    constructor (updateWeightsCB) {
        this.field = [];
        // The potentials queue, this holds all potential nodes.
        this.potentials = [];
        this.updateWeightsCB = updateWeightsCB;
        this.startLocation = {
            x: null,
            y: null,
            tile: null
        };

        this.endLocation = {
            x: null,
            y: null,
            tile: null
        };
        this.foundEnd = false;
        this.path = [];
    }

    Reset() {
        this.potentials = [];
        this.startLocation = {
            x: null,
            y: null,
            tile: null
        };

        this.endLocation = {
            x: null,
            y: null,
            tile: null
        };
        this.foundEnd = false;
        this.path = [];
    }

    UpdateField (field) {
        this.field = field;
        this.Reset();
    }

    FindRoute () {
        this.potentials = [];
        this.findStartEnd();
        this.floodNode(this.startLocation.x, this.startLocation.y);
    }

    inRange(x,y) {
        if(x >= 0 && y >= 0 && x < this.field[0].length && y < this.field.length) {
            return true;
        }

        return false;
    }

    findStartEnd () {
        const width = this.field[0].length;
        const height = this.field.length;
        
        for(let x = 0; x < width; x += 1) {
            for(let y = 0; y < height; y += 1) {
                if(this.field[x][y].type === "start"){
                    this.startLocation.x = x;
                    this.startLocation.y = y;
                    this.startLocation.tile = this.field[x][y];
                    this.potentials.push({x: x, y: y, tile: this.field[x][y]});
                }

                if(this.field[x][y].type === "end"){
                    this.endLocation.x = x;
                    this.endLocation.y = y;
                    this.endLocation.tile = this.field[x][y];
                }
            }
        }    
    }

    floodFromNextNode() {
        // If we've found the end, stop searching and trace the path back.
        if(this.foundEnd) { return; }

        // If the field has been reset or a new path request has been made don't continue with the last route search
        if(this.potentials.length < 1) { return; }

        const current = this.potentials.shift();
     
        this.floodNode(current.x, current.y);
        this.updateWeightsCB(this.field);
    }

    // This takes in the location of a potential node that has already been weighted
    // then looks at its neighbors and gives them a weight/adds them to the potentials queue
    floodNode (x,y) {
        const current = this.field[x][y];

        //this.processHeuristicWeight(x,y, current.weight);

        // Top
        let nx = x;
        let ny = y - 1;
        if(this.nodeIsPotential(nx, ny)) {
            this.processHeuristicWeight(nx,ny, current.weight);
            this.potentials.push({x: nx, y: ny, tile: current});
        }

        // Right
        nx = x + 1;
        ny = y;
        if(this.nodeIsPotential(nx, ny)) {
            this.processHeuristicWeight(nx,ny, current.weight);
            this.potentials.push({x: nx, y: ny, tile: current});
        }

        // Bottom
        nx = x;
        ny = y + 1;
        if(this.nodeIsPotential(nx, ny)) {
            this.processHeuristicWeight(nx,ny, current.weight);
            this.potentials.push({x: nx, y: ny, tile: current});
        }

        // Left
        nx = x - 1;
        ny = y;
        if(this.nodeIsPotential(nx, ny)) {
            this.processHeuristicWeight(nx,ny, current.weight);
            this.potentials.push({x: nx, y: ny, tile: current});
        }

        setTimeout(() => { this.floodFromNextNode()}, 0);
    }

    // For now just assume that traveling one space is a cost of 3
    processHeuristicWeight(x,y, currentWeight) {
        this.field[x][y].weight = currentWeight + 5;
    }

    nodeIsPotential(x,y) {
        // If this node is out of range, it's not a potential
        if(!this.inRange(x,y) || this.foundEnd) { return false; }

        const current = this.field[x][y];

        if(current.type === 'end') {
            this.foundEnd = true;
            this.potentials = [];
            
            setTimeout(this.traceBack.bind(this), 0)
            
            return false;
        }

        // If this node is a wall, it is not a potential
        if(current.type === 'wall') {
            return false;
        }

        // If we've already evaluated this space.. ignore it.
        if(current.weight > 0) {
            return false;
        }


        return true;
    }

    traceBack() {
        // Start from the end node and follow the lowest cost nodes back to the start.
        const end = this.endLocation;
        console.log('tracing it baaaaack', end);
        this.traceNext(end.x, end.y);

    }

    // Look at neighbors, find the lowest cost, designate the lowest cost as the path.
    traceNext (x,y) {
        console.log(x,y)
        this.getLowestTravelCostNeighbor(x,y);
    }

    getLowestTravelCostNeighbor (x,y) {
        let dirs = [
            // North, East, South, West
            [x, y-1], [x+1, y], [x, y+1], [x-1, y] 
        ];

console.log(dirs);
debugger;

        let lowest = { tile: { weight: 2000 } };
        
        // Find the lowest neighbor
        for(let i = 0; i < 4; i += 1) {
            const dir = dirs[i];

            if(this.inRange(dir.x, dir.y)) {
                
                console.log(this.field[dir.x][dir.y]);
    
                if(this.field[dir.x][dir.y].type != end && this.field[dir.x][dir.y].weight < lowest.weight ) {
                    lowest = {x: dir.x, y: dir.y, tile: this.field[dir.x][dir.y]};
                }
            }
        }

        if(lowest.tile.weight === 2000) { debugger; }

        // Designate the lowest as a path and update the map.
        console.log(lowest.tile);
 
        lowest.tile.isPath = true;
        this.UpdateField();

        this.traceNext(lowest.x, lowest.y)
        // setTimeout(() => {
        //     const traceNext = this.traceNext.bind(this);
        //     traceNext(lowest.x, lowest.y);
        // }, 0);
    }
}