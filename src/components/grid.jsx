import React from 'react';
import Tile from './tile';
import AStar from './../classes/a-star';

export default class Grid extends React.Component {
    constructor (props) {
        super(props);

        this.routeFinder = new AStar(this.updateWeights.bind(this));
        this.init = false;
        this.state = {
            width: props.width || 32,
            height: props.height || 32,
            field: []
        }
    }
    
    componentDidMount () {
        if(!this.init) {
            this.generateGrid();
            this.init = true;
        }
    }

    generateGrid() {
        const newState = this.state;
        let field = [];

        // Generate the grid
        for(let h = 0; h < this.state.height; h += 1) {
            field.push([]);

            for(let w = 0; w < this.state.width; w += 1) {
                let weight = 0;
                let tileType = this.getRandomType(h,w);
                
                if(tileType === 'wall') {
                    weight = 0;
                } 

                field[h].push({ weight: weight, type: tileType, isPath: false });
            }
        }

        this.placeStartEnd(field);

        this.routeFinder.UpdateField(field);

        newState.field = field;
        this.setState(newState);
    }

    placeStartEnd (field) {
        let x = Math.floor(Math.random() * this.state.width);
        let y = Math.floor(Math.random() * this.state.height);
        
        field[x][y] = { type: 'start', weight: 0};
        this.clearSpaceAroundPoint(field, x ,y);

        x = Math.abs(x-31);
        y = Math.abs(y-31);

        field[x][y] = { type: 'end', weight: 0};
        this.clearSpaceAroundPoint(field, x ,y);
    }

    clearSpaceAroundPoint(field, x ,y) {
        const dirs = [ 
                [x-1, y-1], [x, y-1], [x +1, y-1],
                [x-1, y],  /*Current*/ [x+1, y],
                [x-1, y+1], [x, y+1], [x+1, y+1]
            ]

        dirs.map(dir => {
            if(this.inRange(dir[0], dir[1])){
                field[dir[0]][dir[1]] = { type: 'open', weight: 0 }
            }
        });
    }

    inRange(x,y) {
        if(x > 0 && y > 0 && x < this.state.width && y < this.state.height) {
            return true;
        }

        return false;
    }

    getRandomType() {
        let ran = Math.random() * 20 + 1;
        
        if(ran > 15) {
            return 'wall';
        }

        return 'open';
    }

    getRandomWeight () {
        return (1 + (Math.random() * 255));
    }

    updateWeights (updatedField) {
        const newState = this.state;
        newState.field = updatedField;

        this.setState(newState);
    }

    render () {
        return (
            <div className="grid" style={ {width: "" + 10 * this.state.width + "px"} }>
                
                { this.state.field.map( (row, rowIndex) => {
                    return(
                        row.map( (tile, tileIndex) => {
                            return (<Tile key={rowIndex + tileIndex + tile.type + tile.weight + tile.isPath} type={ tile.type } weight={ tile.weight} path={ tile.isPath }></Tile>)
                        })
                    );
                })}
                
                <div className="controls">
                    <button onClick={this.generateGrid.bind(this)}> Regen </button>
                    <button onClick={this.routeFinder.FindRoute.bind(this.routeFinder)}> Start </button>
                </div>
            </div>
        );
    }
}