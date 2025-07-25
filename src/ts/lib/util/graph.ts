import { I, S, U, J, Relation } from 'Lib';

class UtilGraph {

	/**
	 * Returns the image source path for a graph node based on its layout and properties.
	 * @param {any} d - The node data object.
	 * @returns {string} The image source path.
	 */
	imageSrc (d: any) {
		d = d || {};

		let src = '';

		switch (d.layout) {
			case I.ObjectLayout.Relation: {
				src = `img/icon/relation/${Relation.iconName(d.relationKey, d.relationFormat)}.svg`;
				break;
			};

			case I.ObjectLayout.Task: {
				src = `img/icon/graph/task${Number(d.done) || 0}.svg`;
				break;
			};

			case I.ObjectLayout.Date: {
				src = `img/icon/relation/date.svg`;
				break;
			};

			case I.ObjectLayout.Audio:
			case I.ObjectLayout.Video:
			case I.ObjectLayout.Pdf:
			case I.ObjectLayout.File: {
				src = U.File.iconPath(d);
				break;
			};

			case I.ObjectLayout.Image: {
				if (d.id) {
					src = S.Common.imageUrl(d.id, I.ImageSize.Small);
				} else {
					src = U.File.iconPath(d);
				};
				break;
			};
				
			case I.ObjectLayout.Human:
			case I.ObjectLayout.Participant: {
				if (d.iconImage) {
					src = S.Common.imageUrl(d.iconImage, I.ImageSize.Small);
				};
				break;
			};

			case I.ObjectLayout.Note: {
				break;
			};

			case I.ObjectLayout.Type: {
				if (d.iconImage) {
					src = S.Common.imageUrl(d.iconImage, I.ImageSize.Small);
				} else
				if (d.iconName) {
					src = U.Common.updateSvg(require(`img/icon/type/default/${d.iconName}.svg`), { 
						id: d.iconName, 
						size: 100, 
						fill: U.Common.iconBgByOption(d.iconOption),
					});
				} else
				if (d.iconEmoji) {
					const code = U.Smile.getCode(d.iconEmoji);
					if (code) {
						src = U.Smile.srcFromColons(code);
					};
					src = src.replace(/^.\//, '');
				};
				break;
			};

			case I.ObjectLayout.Bookmark: {
				if (d.iconImage) {
					src = S.Common.imageUrl(d.iconImage, I.ImageSize.Small);
				};
				break;
			};
				
			default: {
				if (d.iconImage) {
					src = S.Common.imageUrl(d.iconImage, I.ImageSize.Small);
				} else
				if (d.iconEmoji) {
					const code = U.Smile.getCode(d.iconEmoji);
					if (code) {
						src = U.Smile.srcFromColons(code);
					};
					src = src.replace(/^.\//, '');
				};
				break;
			};
		};

		return src;
	};

};

export default new UtilGraph();