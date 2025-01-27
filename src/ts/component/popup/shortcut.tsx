import React, { forwardRef, useState } from 'react';
import { Filter, Icon, Select, Label } from 'Component';
import { I, U, J, translate } from 'Lib';

const PopupShortcut = forwardRef<{}, I.Popup>((props, ref) => {

	const { getId, close } = props;
	const [ page, setPage ] = useState('');
	const isMac = U.Common.isPlatformMac();
	const sections = J.Shortcut();
	const current = page || sections[0].id;
	const section = sections.find(it => it.id == current);
	const id = getId();

	const Section = (item: any) => {
		const cn = [ 'section' ];

		if (item.className) {
			cn.push(item.className);
		};

		return (
			<div className={cn.join(' ')}>
				{item.name ? <div className="name">{item.name}</div> : ''}
				{item.description ? <div className="descr">{item.description}</div> : ''}

				<div className="items">
					{item.children.map((item: any, i: number) => (
						<Item key={i} {...item} />
					))}
				</div>
			</div>
		);
	};

	const Item = (item: any) => {
		//const caption = isMac && item.mac ? item.mac : item.com;
		const symbols = item.symbols || [];

		return (
			<div className="item">
				<div className="name">{item.name}</div>
				<div className="symbols">
					{symbols.map((item: any, i: number) => <Label key={i} text={item} />)}
				</div>
			</div>
		);
	};

	return (
		<>
			<div className="head">
				<div className="sides">
					<div className="side left">
						<Select id={`${id}-section`} options={sections} value={page} onChange={id => setPage(id)} />
					</div>
					<div className="side right">
						<Icon className="more withBackground" />
						<Icon className="close withBackground" tooltip={translate('commonClose')} onClick={() => close()} />
					</div>
				</div>
				<div className="filterWrap">
					<Filter className="outlined" />
				</div>
			</div>

			<div className="body customScrollbar">
				{(section.children || []).map((item: any, i: number) => (
					<Section key={i} {...item} />
				))}
			</div>
		</>
	);

});

export default PopupShortcut;