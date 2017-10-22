import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Fetch, pct, toLength, BuildsOpts } from './common';

class Hero extends Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.changeHero = this.changeHero.bind(this);
	}
	changeHero(ev) {
		this.props.history.push({
			pathname: '/heroes/' + encodeURI(ev.target.value),
			search: this.props.history.location.search,
		});
	}
	componentDidMount() {
		this.update();
	}
	componentDidUpdate(prevProps, prevState) {
		this.update();
	}
	update() {
		const build = this.props.build || this.props.Builds[0].ID;
		const search =
			'/api/get-hero-data?hero=' +
			encodeURIComponent(this.props.match.params.hero) +
			'&build=' +
			encodeURIComponent(build);
		if (this.state.search === search) {
			return;
		}
		this.setState({ Base: null, search: search });
		Fetch(search, data => this.setState(data));
	}
	makeTable(name, prop, basewr, displayFn) {
		if (!displayFn) {
			displayFn = v => v;
		}
		const obj = this.state.Current[prop];
		const elems = Object.keys(obj).map(k => {
			const v = obj[k];
			const total = v.Wins + v.Losses;
			const wr = v.Wins / total * 100;
			let change = 0;
			if (this.state.Previous.Base) {
				const prev = this.state.Previous[prop][k];
				if (prev) {
					const prevtotal = prev.Wins + prev.Losses;
					const prevwr = prev.Wins / prevtotal * 100;
					if (prevwr) {
						change = wr - prevwr;
					}
				}
			}
			return (
				<tr key={k}>
					<td>{displayFn(k)}</td>
					<td>{total}</td>
					<td>{pct(wr)}</td>
					<td>{pct(basewr - wr)}</td>
					<td>{pct(change)}</td>
				</tr>
			);
		});
		return (
			<div>
				<div className="anchor" id={prop.toLowerCase()} />
				<table>
					<thead>
						<tr>
							<th>{name.toLowerCase()}</th>
							<th>games</th>
							<th>winrate</th>
							<th title="winrate relative to base winrate">relative</th>
							<th title="change since previous patch">change</th>
						</tr>
					</thead>
					<tbody>{elems}</tbody>
				</table>
			</div>
		);
	}
	render() {
		let main = 'loading...';
		if (this.state.Current) {
			const basewins = this.state.Current.Base[''].Wins;
			const baselosses = this.state.Current.Base[''].Losses;
			const basetotal = basewins + baselosses;
			const basewr = basewins / basetotal * 100 || 0;

			let change = 0;
			if (this.state.Previous.Base) {
				const prevwins = this.state.Previous.Base[''].Wins;
				const prevlosses = this.state.Previous.Base[''].Losses;
				const prevtotal = prevwins + prevlosses;
				const prevwr = prevwins / prevtotal * 100 || 0;
				change = basewr - prevwr;
			}

			main = (
				<div>
					<table>
						<thead>
							<tr>
								<th>games</th>
								<th>base winrate</th>
								<th title="change since previous patch">change</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>{basetotal}</td>
								<td>{pct(basewr)}</td>
								<td>{pct(change)}</td>
							</tr>
						</tbody>
					</table>
					{this.makeTable('Map', 'Maps', basewr)}
					{this.makeTable(
						'Game Mode',
						'Modes',
						basewr,
						m => this.props.Modes[m]
					)}
					{this.makeTable('Game Length', 'Lengths', basewr, toLength)}
					{this.makeTable('Hero Level', 'Levels', basewr)}
				</div>
			);
		}
		const heroes = this.props.Heroes.map(h => (
			<option key={h.Name}>{h.Name}</option>
		));
		const heroSearch = this.props.build
			? '?build=' + encodeURIComponent(this.props.build)
			: '';
		return (
			<div>
				<h2>{this.props.match.params.hero}</h2>
				<p>
					<Link
						to={
							'/talents/' + encodeURI(this.props.match.params.hero) + heroSearch
						}
					>
						[talents]
					</Link>&nbsp;
					<a href="#maps">[maps]</a>&nbsp;
					<a href="#modes">[game modes]</a>&nbsp;
					<a href="#lengths">[game lengths]</a>&nbsp;
					<a href="#levels">[hero levels]</a>
				</p>
				<div className="row">
					<div className="column">
						<label>Hero</label>
						<select
							name="hero"
							value={this.props.match.params.hero}
							onChange={this.changeHero}
						>
							{heroes}
						</select>
					</div>
					<div className="column">
						<label>Patch</label>
						<select
							name="build"
							value={this.props.build}
							onChange={this.props.handleChange}
						>
							<BuildsOpts builds={this.props.Builds} />
						</select>
					</div>
				</div>
				{main}
			</div>
		);
	}
}

export default Hero;
