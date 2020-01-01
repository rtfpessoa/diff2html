import Clipboard from 'clipboard';

import '../../../main.ts';
import '../../../main.css';
import './index.css';

// eslint-disable-next-line no-new
new Clipboard(document.getElementsByClassName('btn-clipboard')[0]);
