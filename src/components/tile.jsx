import React from 'react';

export default class Tile extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            type: props.type,
            weight: props.weight || 0, // 255 on the high end
            isPath: props.isPath || false
        }
    }

    getTypeClass () {
        switch (this.state.type) {
            case 'wall':
                return 'tile--wall';
            case 'start':
                return 'tile--start';
            case 'end':
                return 'tile--end';
            default:
                return 'tile--open';
        } 
    }

    getWeightClass () {
        if(this.state.weight < 1) {
            return 'weight--0';
        }
        
        let val = Math.floor((this.state.weight / 355) * 100);
        
        return 'weight--' + val;
    }

    getPathClass() {
        if(this.state.isPath) {
            return ' path';
        }

        return '';
    }

    render () {
        return (
            <div className={ this.getTypeClass() + " " + this.getWeightClass() + this.getPathClass() }></div>
        );
    }
}