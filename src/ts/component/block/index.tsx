import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { RouteComponentProps } from 'react-router';
import { I, C, Util, DataUtil, keyboard } from 'ts/lib';
import { Icon, DropTarget, ListChildren } from 'ts/component';
import { throttle } from 'lodash';
import { commonStore, blockStore } from 'ts/store';

import BlockDataview from './dataview';
import BlockText from './text';
import BlockImage from './image';
import BlockIcon from './icon';
import BlockVideo from './video';
import BlockFile from './file';
import BlockBookmark from './bookmark';
import BlockLink from './link';
import BlockCover from './cover';

interface Props extends I.Block, RouteComponentProps<any> {
	index?: number;
	blockStore?: any;
	rootId: string;
	dataset?: any;
	cnt?: number;
	css?: any;
	className?: string;
	onKeyDown? (e: any, text?: string): void;
	onKeyUp? (e: any, text?: string): void;
	onMenuAdd? (id: string): void;
	onPaste? (e: any): void;
};

const $ = require('jquery');
const Constant = require('json/constant.json');
const THROTTLE = 20;

class Block extends React.Component<Props, {}> {

	public static defaultProps = {
		align: I.BlockAlign.Left,
	};

	_isMounted: boolean = false;
		
	constructor (props: any) {
		super(props);
		
		this.onToggle = this.onToggle.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.onDragStart = this.onDragStart.bind(this);
		this.onDrop = this.onDrop.bind(this);
		this.onMenuDown = this.onMenuDown.bind(this);
		this.onMenuClick = this.onMenuClick.bind(this);
		this.onResizeStart = this.onResizeStart.bind(this);
		this.onResize = this.onResize.bind(this);
		this.onResizeEnd = this.onResizeEnd.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
	};

	render () {
		const { id, rootId, childrenIds, type, fields, content, cnt, css, index, align, bgColor, className } = this.props;
		const { style } = content || {};
		
		let canSelect = true;
		let cn: string[] = [ 'block', (index ? 'index-' + index : ''), 'align' + align ];
		let cd: string[] = [];
		let blockComponent = null;
		
		if (className) {
			cn.push(className);
		};
		
		if (bgColor) {
			cd.push('bgColor bgColor-' + bgColor);
		};
		
		switch (type) {
			case I.BlockType.Text:
				cn.push('blockText ' + DataUtil.styleClassText(content.style));
				
				if (content.checked) {
					cn.push('isChecked');
				};
				
				if (content.style == I.TextStyle.Title) {
					canSelect = false;
				};
				
				blockComponent = <BlockText onToggle={this.onToggle} onFocus={this.onFocus} onBlur={this.onBlur} {...this.props} />;
				break;
				
			case I.BlockType.Layout:
				canSelect = false;
				cn.push('blockLayout c' + content.style);
				break;
				
			case I.BlockType.Icon:
				if (!content.name) {
					return null;
				};
			
				canSelect = false;
				cn.push('blockIcon');
				blockComponent = <BlockIcon {...this.props} />;
				break;
				
			case I.BlockType.File:
				switch (content.type) {
					default: 
					case I.FileType.File: 
						cn.push('blockFile');
						blockComponent = <BlockFile {...this.props} />;
						break;
						
					case I.FileType.Image: 
						cn.push('blockMedia');
						blockComponent = <BlockImage {...this.props} />;
						break;
						
					case I.FileType.Video: 
						cn.push('blockMedia');
						blockComponent = <BlockVideo {...this.props} />;
						break;
				};
				break;
				
			case I.BlockType.Bookmark:
				cn.push('blockBookmark');
				blockComponent = <BlockBookmark {...this.props} />;
				break;
			
			case I.BlockType.Dataview:
				cn.push('blockDataview');
				blockComponent = <BlockDataview {...this.props} />;
				break;
				
			case I.BlockType.Div:
				cn.push('blockDiv c' + content.style);
				
				let inner: any = null;
				switch (content.style) {
					case I.DivStyle.Dot:
						inner = (
							<React.Fragment>
								<div className="dot" />
								<div className="dot" />
								<div className="dot" />
							</React.Fragment>
						);
						break;
				};
				
				blockComponent = <div className="div">{inner}</div>;
				break;
				
			case I.BlockType.Link:
				cn.push('blockLink');
				blockComponent = <BlockLink {...this.props} />;
				break;
				
			case I.BlockType.Cover:
				canSelect = false;
				cn.push('blockCover');
				blockComponent = <BlockCover {...this.props} />;
				break;
		};
		
		let element = (
			<DropTarget {...this.props} className={cd.join(' ')} rootId={rootId} id={id} style={style} type={type} dropType={I.DragItem.Block} onDrop={this.onDrop}>
				{blockComponent}
			</DropTarget>
		);
		
		if (canSelect) {
			element = (
				<div className={[ 'selectable', 'c' + id ].join(' ')} data-id={id} data-type={type}>
					{element}
					<div className="selectionOver" />
				</div>
			);
		} else {
			element = (
				<div className="selectable">
					{element}
				</div>
			);
		};
		
		return (
			<div id={'block-' + id} data-id={id} className={cn.join(' ')} style={css}>
				<div className="wrapMenu">
					<div className="icon dnd" draggable={true} onDragStart={this.onDragStart} onMouseDown={this.onMenuDown} onClick={this.onMenuClick} />
				</div>
				
				<div className="wrapContent">
					{element}
					
					{(type == I.BlockType.Layout) && (content.style == I.LayoutStyle.Row) ? (
						<React.Fragment>
							<DropTarget {...this.props} className="targetTop" rootId={rootId} id={id} style={style} type={type} dropType={I.DragItem.Block} onDrop={this.onDrop} />
							<DropTarget {...this.props} className="targetBot" rootId={rootId} id={id} style={style} type={type} dropType={I.DragItem.Block} onDrop={this.onDrop} />
						</React.Fragment>
					): ''}
					
					{childrenIds.length ? <ListChildren {...this.props} onMouseMove={this.onMouseMove} onMouseLeave={this.onMouseLeave} onResizeStart={this.onResizeStart} /> : ''}
				</div>
			</div>
		);
	};
	
	componentDidMount () {
		this._isMounted = true;
	};
	
	componentDidUpdate () {
		const { dataset, id } = this.props;
		const { selection } = dataset;
		
		if (selection) {
			selection.set(selection.get());
		};
	};
	
	componentWillUnmount () {
		this._isMounted = false;
	};
	
	onToggle (e: any) {
		if (!this._isMounted) {
			return;
		};
		
		const node = $(ReactDOM.findDOMNode(this));
		node.hasClass('isToggled') ? node.removeClass('isToggled') : node.addClass('isToggled');
	};
	
	onDragStart (e: any) {
		if (!this._isMounted) {
			return;
		};
		
		const { dataset, id, type, content } = this.props;
		const { selection, onDragStart } = dataset;
		
		if (!dataset) {
			return;
		};
		
		const { style } = content;

		let canDrag = true;
		
		if (type == I.BlockType.Icon) {
			canDrag = false;
		};
		
		if (style == I.TextStyle.Title) {
			canDrag = false;
		};
		
		if (!canDrag) {
			e.preventDefault();
			e.stopPropagation();
			return;
		};
		
		let ids = [ id ];
		if (selection) {
			let selectedIds = selection.get();
			if (selectedIds.length && (selectedIds.indexOf(id) >= 0)) {
				ids = selectedIds;
			};
			
			selection.set(ids);
			selection.hide();
			selection.setPreventSelect(true);
			selection.setPreventClear(true);
		};
		
		if (onDragStart) {
			onDragStart(e, I.DragItem.Block, ids, this);				
		};
	};
	
	onDrop (e: any, type: string, targetId: string, position: I.BlockPosition) {
		const { dataset } = this.props;
		const { selection, onDrop } = dataset;
		
		if (selection) {
			selection.setPreventClear(false);
		};
		
		if (dataset && onDrop) {
			onDrop(e, type, targetId, position);			
		};
	};
	
	onMenuDown (e: any) {
		const { dataset, id, rootId } = this.props;
		const { selection } = dataset;
		
		if (selection) {
			selection.setPreventClear(true);
		};
	};
	
	onMenuClick (e: any) {
		if (!this._isMounted) {
			return;
		};
		
		const { dataset, id, rootId } = this.props;
		const { selection } = dataset;
		const node = $(ReactDOM.findDOMNode(this));
		
		commonStore.menuOpen('blockAction', { 
			element: '#block-' + id,
			type: I.MenuType.Vertical,
			offsetX: node.outerWidth() - 26,
			offsetY: -node.outerHeight(),
			vertical: I.MenuDirection.Bottom,
			horizontal: I.MenuDirection.Right,
			data: {
				blockId: id,
				blockIds: DataUtil.selectionGet(this.props),
				rootId: rootId,
				dataset: dataset,
			},
			onClose: () => {
				selection.setPreventClear(false);
				selection.clear();
			}
		});
	};
	
	onFocus (e: any) {
		if (!this._isMounted) {
			return;
		};
		
		const node = $(ReactDOM.findDOMNode(this));
		node.addClass('isFocused');
	};
	
	onBlur (e: any) {
		if (!this._isMounted) {
			return;
		};
		
		const node = $(ReactDOM.findDOMNode(this));
		node.removeClass('isFocused');
	};
	
	onResizeStart (e: any, index: number) {
		if (!this._isMounted) {
			return;
		};
		
		const { dataset, childBlocks } = this.props;
		const { selection } = dataset;
		const win = $(window);
		const node = $(ReactDOM.findDOMNode(this));
		const prevBlock = childBlocks[index - 1];
		const currentBlock = childBlocks[index];
		
		let offset = node.find('#block-' + $.escapeSelector(prevBlock.id)).offset().left + Constant.size.blockMenu;
		
		if (selection) {
			selection.setPreventSelect(true);
		};
		this.unbind();
		node.addClass('isResizing');
		keyboard.setResize(true);
		
		win.on('mousemove.block', (e: any) => { this.onResize(e, index, offset); });
		win.on('mouseup.block', throttle((e: any) => { this.onResizeEnd(e, index, offset); }));
		
		node.find('.resizable').trigger('resizeStart', [ e ]);
	};

	onResize (e: any, index: number, offset: number) {
		if (!this._isMounted) {
			return;
		};
		
		e.preventDefault();
		e.stopPropagation();
		
		const { childBlocks } = this.props;		
		const node = $(ReactDOM.findDOMNode(this));
		const prevBlock = childBlocks[index - 1];
		const prevNode = node.find('#block-' + $.escapeSelector(prevBlock.id));
		const currentBlock = childBlocks[index];
		const currentNode = node.find('#block-' + $.escapeSelector(currentBlock.id));
		const res = this.calcWidth(e.pageX - offset, index);
		
		const w1 = res.percent * res.sum;
		const w2 = (1 - res.percent) * res.sum;
		
		prevNode.css({ width: w1 * 100 + '%' });
		currentNode.css({ width: w2 * 100 + '%' });
		
		node.find('.colResize.active').removeClass('active');
		node.find('.colResize.c' + index).addClass('active');
		
		node.find('.resizable').trigger('resize', [ e ]);
	};

	onResizeEnd (e: any, index: number, offset: number) {
		if (!this._isMounted) {
			return;
		};
		
		const { dataset, childBlocks, rootId } = this.props;
		const { selection } = dataset;
		const node = $(ReactDOM.findDOMNode(this));
		const prevBlock = childBlocks[index - 1];
		const currentBlock = childBlocks[index];
		const res = this.calcWidth(e.pageX - offset, index);
		
		if (selection) {
			selection.setPreventSelect(false);	
		};
		this.unbind();
		node.removeClass('isResizing');
		keyboard.setResize(false);
		
		C.BlockListSetFields(rootId, [
			{ blockId: prevBlock.id, fields: { width: res.percent * res.sum } },
			{ blockId: currentBlock.id, fields: { width: (1 - res.percent) * res.sum } },
		]);
		
		node.find('.resizable').trigger('resizeEnd', [ e ]);
	};
	
	calcWidth (x: number, index: number) {
		const { childBlocks } = this.props;
		const prevBlock = childBlocks[index - 1];
		const currentBlock = childBlocks[index];
		const dw = 1 / childBlocks.length;
		const sum = (prevBlock.fields.width || dw) + (currentBlock.fields.width || dw);
		const offset = Constant.size.blockMenu + 50;
		
		x = Math.max(offset, x);
		x = Math.min(sum * Constant.size.editorPage - offset, x);
		x = x / (sum * Constant.size.editorPage);
		
		return { sum: sum, percent: x };
	};
	
	onMouseMove (e: any) {
		if (!this._isMounted) {
			return;
		};
		
		const { rootId, id, childBlocks, type, content } = this.props;
		const { style } = content;
		const node = $(ReactDOM.findDOMNode(this));
		
		if (!childBlocks.length || (type != I.BlockType.Layout) || (style != I.LayoutStyle.Row)) {
			return;
		};
		
		const rect = node.get(0).getBoundingClientRect() as DOMRect;
		const p = (e.pageX - rect.x) / (Constant.size.editorPage + 50);
		
		let c = 0;
		let num = 0;
		
		for (let i in childBlocks) {
			const child = childBlocks[i];
			
			c += child.fields.width || 1 / childBlocks.length;
			if ((p >= c - 0.1) && (p <= c + 0.1)) {
				num = Number(i) + 1;
				break;
			};
		};
		
		node.find('.colResize.active').removeClass('active');
		if (num) {
			node.find('.colResize.c' + num).addClass('active');
		};
	};
	
	onMouseLeave (e: any) {
		$('.colResize.active').removeClass('active');
	};
	
	unbind () {
		$(window).unbind('mousemove.block mouseup.block');
	};
	
};

export default Block;