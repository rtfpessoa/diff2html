import Clipboard from 'clipboard';

import '../../../main.ts';
import '../../../main.css';
import './index.css';

new Clipboard(document.getElementsByClassName('clipboard')[0]);
